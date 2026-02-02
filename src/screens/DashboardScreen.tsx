import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { formatCurrency, formatPercent } from '../utils/format';
import { styles } from './DashboardScreen.styles';

type PeriodType = 'monthly' | 'weekly' | 'biweekly' | 'yearly';

type Stream = {
  id: string;
  name: string;
  amount: number; // Amount in the original period
  period: PeriodType; // Original period when added
  color: string;
};

type TabType = 'income' | 'expense' | 'net';

// Period conversion factors (payments per year)
const PERIOD_FACTORS: Record<PeriodType, number> = {
  monthly: 12,
  weekly: 52,
  biweekly: 24,
  yearly: 1,
};

// iPhone calendar-like color palette
const COLOR_PALETTE = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#00C7BE', // Teal
  '#007AFF', // Blue
  '#5856D6', // Indigo
  '#AF52DE', // Purple
  '#FF2D55', // Pink
  '#8E8E93', // Gray
];

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [viewPeriod, setViewPeriod] = useState<PeriodType>('monthly');
  const [incomeStreams, setIncomeStreams] = useState<Stream[]>([]);
  const [expenseStreams, setExpenseStreams] = useState<Stream[]>([]);
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamAmount, setNewStreamAmount] = useState('');
  const [newStreamPeriod, setNewStreamPeriod] = useState<PeriodType>('monthly');
  const [newStreamColor, setNewStreamColor] = useState<string>(COLOR_PALETTE[0]);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<{ id: string; name: string } | null>(null);

  // Convert amount from one period to another
  const convertAmount = (amount: number, fromPeriod: PeriodType, toPeriod: PeriodType): number => {
    if (fromPeriod === toPeriod) return amount;
    const fromFactor = PERIOD_FACTORS[fromPeriod];
    const toFactor = PERIOD_FACTORS[toPeriod];
    // Convert to yearly first, then to target period
    const yearlyAmount = amount * fromFactor;
    return yearlyAmount / toFactor;
  };

  // Get converted amount for a stream based on current view period
  const getConvertedAmount = (stream: Stream): number => {
    return convertAmount(stream.amount, stream.period, viewPeriod);
  };

  // Calculate totals (converted to view period)
  const incomeTotal = useMemo(
    () => incomeStreams.reduce((sum, stream) => sum + getConvertedAmount(stream), 0),
    [incomeStreams, viewPeriod]
  );
  const expenseTotal = useMemo(
    () => expenseStreams.reduce((sum, stream) => sum + getConvertedAmount(stream), 0),
    [expenseStreams, viewPeriod]
  );
  const netTotal = incomeTotal - expenseTotal;
  const netMarginPercent = incomeTotal > 0 ? (netTotal / incomeTotal) * 100 : 0;

  // Add or update stream
  const handleAddStream = () => {
    const amount = parseFloat(newStreamAmount);
    if (!newStreamName.trim() || isNaN(amount) || amount <= 0) {
      return;
    }

    if (editingStreamId) {
      // Update existing stream
      const updateStream = (streams: Stream[]) =>
        streams.map((s) =>
          s.id === editingStreamId
            ? {
                ...s,
                name: newStreamName.trim(),
                amount,
                period: newStreamPeriod,
                color: newStreamColor,
              }
            : s
        );

      if (activeTab === 'income') {
        setIncomeStreams(updateStream(incomeStreams));
      } else {
        setExpenseStreams(updateStream(expenseStreams));
      }
    } else {
      // Add new stream
      const newStream: Stream = {
        id: Date.now().toString(),
        name: newStreamName.trim(),
        amount,
        period: newStreamPeriod,
        color: newStreamColor,
      };

      if (activeTab === 'income') {
        setIncomeStreams([...incomeStreams, newStream]);
      } else {
        setExpenseStreams([...expenseStreams, newStream]);
      }
    }

    handleCloseModal();
  };

  // Open modal for adding
  const handleOpenModal = () => {
    setEditingStreamId(null);
    setNewStreamName('');
    setNewStreamAmount('');
    setNewStreamPeriod('monthly');
    setNewStreamColor(COLOR_PALETTE[0]);
    setIsModalVisible(true);
  };

  // Open modal for editing
  const handleEditStream = (stream: Stream) => {
    setEditingStreamId(stream.id);
    setNewStreamName(stream.name);
    setNewStreamAmount(stream.amount.toString());
    setNewStreamPeriod(stream.period);
    setNewStreamColor(stream.color);
    setIsModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingStreamId(null);
    setNewStreamName('');
    setNewStreamAmount('');
    setNewStreamPeriod('monthly');
    setNewStreamColor(COLOR_PALETTE[0]);
    setIsColorPickerVisible(false);
  };

  // Show delete confirmation dialog
  const handleDeleteStream = (stream: Stream) => {
    setStreamToDelete({ id: stream.id, name: stream.name });
    setIsDeleteDialogVisible(true);
  };

  // Confirm and delete stream
  const handleConfirmDelete = () => {
    if (!streamToDelete) return;

    if (activeTab === 'income') {
      setIncomeStreams(incomeStreams.filter((s) => s.id !== streamToDelete.id));
    } else {
      setExpenseStreams(expenseStreams.filter((s) => s.id !== streamToDelete.id));
    }

    setIsDeleteDialogVisible(false);
    setStreamToDelete(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogVisible(false);
    setStreamToDelete(null);
  };

  // Prepare chart data (using converted amounts, sorted by value ascending - least to most)
  const chartData = useMemo((): Array<{
    value: number;
    color: string;
    label: string;
    stream?: Stream;
  }> => {
    if (activeTab === 'income') {
      return incomeStreams
        .map((stream) => ({
          stream,
          convertedAmount: getConvertedAmount(stream),
        }))
        .filter((item) => item.convertedAmount > 0)
        .sort((a, b) => a.convertedAmount - b.convertedAmount) // Sort ascending (least to most)
        .map((item) => ({
          value: item.convertedAmount,
          color: item.stream.color,
          label: item.stream.name,
          stream: item.stream, // Keep stream reference for legend
        }));
    } else if (activeTab === 'expense') {
      return expenseStreams
        .map((stream) => ({
          stream,
          convertedAmount: getConvertedAmount(stream),
        }))
        .filter((item) => item.convertedAmount > 0)
        .sort((a, b) => a.convertedAmount - b.convertedAmount) // Sort ascending (least to most)
        .map((item) => ({
          value: item.convertedAmount,
          color: item.stream.color,
          label: item.stream.name,
          stream: item.stream, // Keep stream reference for legend
        }));
    } else {
      // Net Margin tab - 2 slices (sort by value, least to most)
      const data = [];
      if (incomeTotal > 0) {
        data.push({
          value: incomeTotal,
          color: '#1A3FBC',
          label: 'Income',
        });
      }
      if (expenseTotal > 0) {
        data.push({
          value: expenseTotal,
          color: '#FFB6C1',
          label: 'Expense',
        });
      }
      // Sort by value ascending (least to most)
      return data.sort((a, b) => a.value - b.value);
    }
  }, [activeTab, incomeStreams, expenseStreams, viewPeriod, incomeTotal, expenseTotal]);

  const currentStreams = activeTab === 'income' ? incomeStreams : expenseStreams;
  const total = activeTab === 'income' ? incomeTotal : activeTab === 'expense' ? expenseTotal : netTotal;

  // Memoize sorted streams list for display (least to most)
  const sortedStreams = useMemo(() => {
    return [...currentStreams].sort((a, b) => getConvertedAmount(a) - getConvertedAmount(b));
  }, [currentStreams, viewPeriod]);

  // Calculate percentages
  const getStreamPercent = (amount: number): number => {
    if (activeTab === 'net') {
      const totalForPercent = incomeTotal + expenseTotal;
      return totalForPercent > 0 ? (amount / totalForPercent) * 100 : 0;
    }
    return total > 0 ? (amount / total) * 100 : 0;
  };

  const getPeriodLabel = (period: PeriodType): string => {
    switch (period) {
      case 'monthly':
        return 'Monthly';
      case 'weekly':
        return 'Weekly';
      case 'biweekly':
        return 'Bi-Weekly';
      case 'yearly':
        return 'Yearly';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <Text style={styles.periodLabel}>View Period:</Text>
        <View style={styles.periodButtons}>
          {(['monthly', 'weekly', 'biweekly', 'yearly'] as PeriodType[]).map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                viewPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setViewPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  viewPeriod === period && styles.periodButtonTextActive,
                ]}
              >
                {getPeriodLabel(period)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'income' && styles.segmentActive]}
          onPress={() => setActiveTab('income')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'income' && styles.segmentTextActive,
            ]}
          >
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'expense' && styles.segmentActive]}
          onPress={() => setActiveTab('expense')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'expense' && styles.segmentTextActive,
            ]}
          >
            Expenses
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segment, activeTab === 'net' && styles.segmentActive]}
          onPress={() => setActiveTab('net')}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'net' && styles.segmentTextActive,
            ]}
          >
            Cash Flow
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Card */}
      <View style={styles.card}>
        {chartData.length > 0 ? (
          <View style={styles.chartContainer}>
            <PieChart
              data={[...chartData]}
              donut
              radius={120}
              innerRadius={80}
              innerCircleColor="#F7F8FC"
              initialAngle={0}
              centerLabelComponent={() => (
                <View style={styles.centerLabel}>
                  <Text style={styles.centerValue}>
                    {formatCurrency(total)}
                  </Text>
                  {activeTab === 'net' && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {formatPercent(netMarginPercent)} Margin
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Add your first stream to see the breakdown.
            </Text>
          </View>
        )}
      </View>

      {/* Net Margin Summary */}
      {activeTab === 'net' && (incomeTotal > 0 || expenseTotal > 0) && (
        <View style={styles.card}>
          <Text style={styles.formTitle}>Summary</Text>
          {incomeTotal > 0 && (
            <View style={styles.streamRow}>
              <View style={[styles.streamDot, { backgroundColor: '#1A3FBC' }]} />
              <View style={styles.streamInfo}>
                <Text style={styles.streamName}>Income</Text>
                <Text style={styles.streamAmount}>
                  {formatCurrency(incomeTotal)} / {getPeriodLabel(viewPeriod)} • {formatPercent(getStreamPercent(incomeTotal))}
                </Text>
              </View>
            </View>
          )}
          {expenseTotal > 0 && (
            <View style={styles.streamRow}>
              <View style={[styles.streamDot, { backgroundColor: '#FFB6C1' }]} />
              <View style={styles.streamInfo}>
                <Text style={styles.streamName}>Expenses</Text>
                <Text style={styles.streamAmount}>
                  {formatCurrency(expenseTotal)} / {getPeriodLabel(viewPeriod)} • {formatPercent(getStreamPercent(expenseTotal))}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Streams List */}
      {activeTab !== 'net' && sortedStreams.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            {activeTab === 'income' ? 'Income' : 'Expense'} Streams
          </Text>
          {sortedStreams.map((stream) => {
            const convertedAmount = getConvertedAmount(stream);
            const percent = getStreamPercent(convertedAmount);
            return (
              <View key={stream.id} style={styles.streamRow}>
                <View style={[styles.streamDot, { backgroundColor: stream.color }]} />
                <View style={styles.streamInfo}>
                  <Text style={styles.streamName}>{stream.name}</Text>
                  <Text style={styles.streamAmount}>
                    {formatCurrency(convertedAmount)} / {getPeriodLabel(viewPeriod)} • {formatPercent(percent)}
                  </Text>
                  {stream.period !== viewPeriod && (
                    <Text style={styles.streamOriginal}>
                      ({formatCurrency(stream.amount)} / {getPeriodLabel(stream.period)})
                    </Text>
                  )}
                </View>
                <View style={styles.streamActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditStream(stream)}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#8E8E93" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteStream(stream)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#B71C1C" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
      </ScrollView>

      {/* Floating Add Button */}
      {activeTab !== 'net' && (
        <TouchableOpacity style={styles.fab} onPress={handleOpenModal}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Add Stream Modal - Bottom Drawer */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity
            style={styles.drawerOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.drawerContainer}
            keyboardVerticalOffset={0}
          >
            <View style={styles.drawerContent} onStartShouldSetResponder={() => true}>
              {/* Drawer Handle */}
              <View style={styles.drawerHandle} />
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingStreamId ? 'Edit' : 'Add'} {activeTab === 'income' ? 'Income' : 'Expense'}
                  </Text>
                  <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  style={styles.modalFormScroll}
                  contentContainerStyle={styles.modalForm}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  keyboardDismissMode="interactive"
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Stream name"
                    placeholderTextColor="#999"
                    value={newStreamName}
                    onChangeText={setNewStreamName}
                    autoFocus={Platform.OS === 'ios'}
                    showSoftInputOnFocus={true}
                    keyboardType="default"
                    editable={true}
                  />
                <Text style={styles.inputLabel}>Color:</Text>
                <View style={styles.colorPickerContainer}>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => setIsColorPickerVisible(!isColorPickerVisible)}
                  >
                    <View style={[styles.colorPickerPreview, { backgroundColor: newStreamColor }]} />
                    <Text style={styles.colorPickerButtonText}>Select Color</Text>
                    <Ionicons 
                      name={isColorPickerVisible ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color="#666" 
                    />
                  </TouchableOpacity>
                  {isColorPickerVisible && (
                    <View style={styles.colorPickerDropdown}>
                        {COLOR_PALETTE.map((color) => (
                          <TouchableOpacity
                            key={color}
                            style={styles.colorPickerDropdownItem}
                            onPress={() => {
                              setNewStreamColor(color);
                              setIsColorPickerVisible(false);
                            }}
                          >
                            <View style={[styles.colorPickerPopupDot, { backgroundColor: color }]} />
                            <Text style={styles.colorPickerDropdownItemText}>Color</Text>
                            {newStreamColor === color && (
                              <Ionicons name="checkmark" size={20} color="#1A3FBC" style={styles.colorPickerPopupCheck} />
                            )}
                          </TouchableOpacity>
                        ))}
                    </View>
                  )}
                </View>
                <Text style={styles.inputLabel}>Amount Period:</Text>
                <View style={styles.modalPeriodSelector}>
                  {(['monthly', 'weekly', 'biweekly', 'yearly'] as PeriodType[]).map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={[
                        styles.modalPeriodButton,
                        newStreamPeriod === period && styles.modalPeriodButtonActive,
                      ]}
                      onPress={() => setNewStreamPeriod(period)}
                    >
                      <Text
                        style={[
                          styles.modalPeriodButtonText,
                          newStreamPeriod === period && styles.modalPeriodButtonTextActive,
                        ]}
                      >
                        {getPeriodLabel(period)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder={`Amount (${getPeriodLabel(newStreamPeriod)})`}
                  placeholderTextColor="#999"
                  value={newStreamAmount}
                  onChangeText={setNewStreamAmount}
                  keyboardType="numeric"
                  showSoftInputOnFocus={true}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddStream}>
                  <Text style={styles.addButtonText}>
                    {editingStreamId ? 'Save Changes' : 'Add Stream'}
                  </Text>
                </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal
        visible={isDeleteDialogVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancelDelete}
      >
        <View style={styles.deleteDialogOverlay}>
          <TouchableOpacity
            style={styles.deleteDialogOverlayTouchable}
            activeOpacity={1}
            onPress={handleCancelDelete}
          />
          <View style={styles.deleteDialogContent}>
            <Text style={styles.deleteDialogTitle}>Delete {activeTab === 'income' ? 'Income' : 'Expense'}?</Text>
            <Text style={styles.deleteDialogMessage}>
              Are you sure you want to delete "{streamToDelete?.name}"? This action cannot be undone.
            </Text>
            <View style={styles.deleteDialogButtons}>
              <TouchableOpacity
                style={styles.deleteDialogCancelButton}
                onPress={handleCancelDelete}
              >
                <Text style={styles.deleteDialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteDialogConfirmButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteDialogConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

