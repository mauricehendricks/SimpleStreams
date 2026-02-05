import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Settings } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardSkeleton } from '../components/DashboardSkeleton';
import { HydrationErrorState } from '../components/HydrationErrorState';
import { ProfileScenarioHeader } from '../components/ProfileScenarioHeader';
import { TaxAllocationSheet } from '../components/TaxAllocationSheet';
import { AddStreamModal } from '../controls/AddStreamModal';
import { ChartCard } from '../controls/ChartCard';
import { DeleteDialog } from '../controls/DeleteDialog';
import { FloatingAddButton } from '../controls/FloatingAddButton';
import { NetMarginSummary } from '../controls/NetMarginSummary';
import { PeriodSelector } from '../controls/PeriodSelector';
import { StreamsList } from '../controls/StreamsList';
import { TabSelector } from '../controls/TabSelector';
import { useHydrationGate } from '../hooks/useHydrationGate';
import { useViewComputed } from '../hooks/useViewComputed';
import { Stream, TabType, ViewPeriod } from '../state/types';
import { usePremiumStore } from '../state/usePremiumStore';
import { useSimpleStreamsStore } from '../state/useSimpleStreamsStore';
import {
  getCashFlowExpenseColor,
  getCashFlowIncomeColor,
  getExpenseColor,
  getIncomeColor
} from '../utils/colorAssignment';
import { convertAmount } from '../utils/periodConversion';
import { styles } from './DashboardScreen.styles';

export default function DashboardScreen() {
  const router = useRouter();
  const { status, retry, resetData } = useHydrationGate();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('income');
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('monthly');
  const [newStreamName, setNewStreamName] = useState('');
  const [newStreamAmount, setNewStreamAmount] = useState('');
  const [newStreamPeriod, setNewStreamPeriod] = useState<ViewPeriod>('monthly');
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
  const [streamToDelete, setStreamToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showTaxAllocationSheet, setShowTaxAllocationSheet] = useState(false);

  const isPremium = usePremiumStore((state) => state.isPremium);
  const view = useSimpleStreamsStore((state) => state.getActiveView());
  const incomeStreams = view?.income || [];
  const expenseStreams = view?.expenses || [];
  const addIncomeStream = useSimpleStreamsStore((state) => state.addIncomeStream);
  const deleteIncomeStream = useSimpleStreamsStore((state) => state.deleteIncomeStream);
  const updateIncomeStream = useSimpleStreamsStore((state) => state.updateIncomeStream);
  const addExpenseStream = useSimpleStreamsStore((state) => state.addExpenseStream);
  const deleteExpenseStream = useSimpleStreamsStore((state) => state.deleteExpenseStream);
  const updateExpenseStream = useSimpleStreamsStore((state) => state.updateExpenseStream);

  const {
    incomeTotal,
    taxAmount,
    expenseTotalWithTax,
    netTotal,
    netMarginPercent,
  } = useViewComputed(viewPeriod);

  // Update newStreamPeriod when viewPeriod changes (for new streams)
  useEffect(() => {
    if (!editingStreamId) {
      setNewStreamPeriod(viewPeriod);
    }
  }, [viewPeriod, editingStreamId]);

  // Get converted amount for a stream based on current view period
  // Memoized to prevent unnecessary recalculations in useMemo hooks
  const getConvertedAmount = useCallback((stream: Stream): number => {
    return convertAmount(stream.amount, stream.viewPeriod, viewPeriod);
  }, [viewPeriod]);

  // Add or update stream
  const handleAddStream = () => {
    const amount = parseFloat(newStreamAmount);
    if (!newStreamName.trim() || isNaN(amount) || amount <= 0) {
      return;
    }

    // Color will be auto-assigned by the store based on value rank
    const stream: Stream = {
      id: editingStreamId || Date.now().toString(),
      name: newStreamName.trim(),
      amount,
      viewPeriod: newStreamPeriod,
      color: '#1A3FBC', // Temporary, will be reassigned by store
    };

    if (editingStreamId) {
      // Update existing stream
      if (activeTab === 'income') {
        updateIncomeStream(editingStreamId, stream);
      } else {
        updateExpenseStream(editingStreamId, stream);
      }
    } else {
      // Add new stream
      if (activeTab === 'income') {
        addIncomeStream(stream);
      } else {
        addExpenseStream(stream);
      }
    }

    handleCloseModal();
  };

  // Open modal for adding
  const handleOpenModal = () => {
    setEditingStreamId(null);
    setNewStreamName('');
    setNewStreamAmount('');
    setNewStreamPeriod(viewPeriod);
    setIsModalVisible(true);
  };

  // Open modal for editing
  const handleEditStream = (stream: Stream) => {
    setEditingStreamId(stream.id);
    setNewStreamName(stream.name);
    setNewStreamAmount(stream.amount.toString());
    setNewStreamPeriod(stream.viewPeriod);
    setIsModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingStreamId(null);
    setNewStreamName('');
    setNewStreamAmount('');
    setNewStreamPeriod(viewPeriod);
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
      deleteIncomeStream(streamToDelete.id);
    } else {
      deleteExpenseStream(streamToDelete.id);
    }

    setIsDeleteDialogVisible(false);
    setStreamToDelete(null);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setIsDeleteDialogVisible(false);
    setStreamToDelete(null);
  };

  // Single source of truth: Calculate all stream colors based on converted amounts
  // This ensures chart data and stream list use the same colors and ranking
  const incomeColorMap = useMemo((): Map<string, string> => {
    const colorMap = new Map<string, string>();
    
    if (activeTab !== 'income') {
      return colorMap;
    }
    
    const streamsWithAmounts = incomeStreams
      .map((stream) => ({
        stream,
        convertedAmount: getConvertedAmount(stream),
      }))
      .filter((item) => item.convertedAmount > 0);
    
    if (streamsWithAmounts.length === 0) {
      return colorMap;
    }
    
    // Calculate colors for all income streams together based on converted amounts
    const allIncomeItems = streamsWithAmounts.map(item => ({ 
      amount: item.convertedAmount, 
      id: item.stream.id 
    }));
    
    // Sort by amount to determine ranks (same logic as assignColorsToStreams)
    const sorted = [...allIncomeItems].sort((a, b) => a.amount - b.amount);
    
    // Assign colors based on rank
    sorted.forEach((item, index) => {
      const rank = sorted.length > 1 ? index / (sorted.length - 1) : 1;
      const color = getIncomeColor(rank);
      colorMap.set(item.id, color);
    });
    
    return colorMap;
  }, [activeTab, incomeStreams, viewPeriod, getConvertedAmount]);

  // Calculate expense stream colors and tax color together based on converted amounts
  // This ensures all colors are calculated from the same set of values
  const expenseColorMap = useMemo((): Map<string, string> & { taxColor?: string } => {
    const colorMap = new Map<string, string>() as Map<string, string> & { taxColor?: string };
    
    if (activeTab !== 'expense') {
      return colorMap;
    }
    
    const streamsWithAmounts = expenseStreams
      .map((stream) => ({
        stream,
        convertedAmount: getConvertedAmount(stream),
      }))
      .filter((item) => item.convertedAmount > 0);
    
    // If no expenses, use primary red for tax
    if (streamsWithAmounts.length === 0) {
      colorMap.taxColor = getCashFlowExpenseColor();
      return colorMap;
    }
    
    // Calculate colors for all expenses + tax together based on converted amounts
    // This ensures tax gets the correct rank among all expenses
    const allExpenseItems = [
      ...streamsWithAmounts.map(item => ({ amount: item.convertedAmount, id: item.stream.id, isTax: false })),
      { amount: taxAmount, id: 'tax', isTax: true }
    ];
    
    // Sort by amount to determine ranks (same logic as assignColorsToStreams)
    const sorted = [...allExpenseItems].sort((a, b) => a.amount - b.amount);
    
    // Assign colors based on rank
    sorted.forEach((item, index) => {
      const rank = sorted.length > 1 ? index / (sorted.length - 1) : 1;
      const color = getExpenseColor(rank);
      
      if (item.isTax) {
        colorMap.taxColor = color;
      } else {
        colorMap.set(item.id, color);
      }
    });
    
    return colorMap;
  }, [activeTab, expenseStreams, viewPeriod, taxAmount, getConvertedAmount]);
  
  const taxColor = expenseColorMap.taxColor || getCashFlowExpenseColor();

  // Prepare chart data (using converted amounts, sorted by value ascending - least to most)
  const chartData = useMemo((): Array<{
    value: number;
    color: string;
    label: string;
    stream?: Stream;
  }> => {
    if (activeTab === 'income') {
      const streamsWithAmounts = incomeStreams
        .map((stream) => ({
          stream,
          convertedAmount: getConvertedAmount(stream),
        }))
        .filter((item) => item.convertedAmount > 0)
        .sort((a, b) => a.convertedAmount - b.convertedAmount);
      
      // Use recalculated colors based on converted amounts (single source of truth)
      return streamsWithAmounts.map((item) => {
        const color = incomeColorMap.get(item.stream.id) || item.stream.color;
        return {
          value: item.convertedAmount,
          color,
          label: item.stream.name,
          stream: item.stream,
        };
      });
    } else if (activeTab === 'expense') {
      const streamsWithAmounts = expenseStreams
        .map((stream) => ({
          stream,
          convertedAmount: getConvertedAmount(stream),
        }))
        .filter((item) => item.convertedAmount > 0)
        .sort((a, b) => a.convertedAmount - b.convertedAmount);
      
      // Use recalculated colors based on converted amounts (for consistency with tax)
      const expenseData: Array<{
        value: number;
        color: string;
        label: string;
        stream?: Stream;
      }> = streamsWithAmounts.map((item) => {
        // Use recalculated color from expenseColorMap, fallback to stored color
        const color = expenseColorMap.get(item.stream.id) || item.stream.color;
        return {
          value: item.convertedAmount,
          color,
          label: item.stream.name,
          stream: item.stream,
        };
      });

      // Only add taxes if premium
      if (isPremium) {
        // Always add taxes as a virtual expense (even if $0)
        const hasOtherExpenses = expenseData.length > 0;
        const taxValue = !hasOtherExpenses && taxAmount === 0 ? 0.01 : taxAmount;
        
        expenseData.push({
          value: taxValue,
          color: expenseColorMap.taxColor || getCashFlowExpenseColor(),
          label: 'Taxes',
        });
      }

      // Sort all expenses (including taxes if premium)
      return expenseData.sort((a, b) => a.value - b.value);
    } else {
      // Net Margin tab - 2 slices (sort by value, least to most)
      const data = [];
      if (incomeTotal > 0) {
        data.push({
          value: incomeTotal,
          color: getCashFlowIncomeColor(),
          label: 'Income',
        });
      }
      if (expenseTotalWithTax > 0) {
        data.push({
          value: expenseTotalWithTax,
          color: getCashFlowExpenseColor(),
          label: 'Expense',
        });
      }
      return data.sort((a, b) => a.value - b.value);
    }
  }, [activeTab, incomeStreams, expenseStreams, viewPeriod, incomeTotal, expenseTotalWithTax, taxAmount, incomeColorMap, expenseColorMap, getConvertedAmount, isPremium]);

  const currentStreams = activeTab === 'income' ? incomeStreams : expenseStreams;
  const total = activeTab === 'income' ? incomeTotal : activeTab === 'expense' ? expenseTotalWithTax : netTotal;

  // Calculate percentages
  const getStreamPercent = (amount: number): number => {
    if (activeTab === 'net') {
      const totalForPercent = incomeTotal + expenseTotalWithTax;
      return totalForPercent > 0 ? (amount / totalForPercent) * 100 : 0;
    }
    return total > 0 ? (amount / total) * 100 : 0;
  };

  // Show loading skeleton
  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  // Show error state
  if (status === 'error') {
    return <HydrationErrorState />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      {/* Gradient overlay at top to blend with status bar */}
      <LinearGradient
        colors={['rgba(238, 240, 246, 1)', 'rgba(238, 240, 246, 0)']}
        style={[styles.gradientOverlay, { height: insets.top + 16 }]}
        pointerEvents="none"
      />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 12 } // Safe area + reasonable spacing
        ]}
        contentInsetAdjustmentBehavior="never"
        contentInset={{ top: 0, bottom: 0 }}
        scrollIndicatorInsets={{ top: insets.top }}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ProfileScenarioHeader />
          </View>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => router.push('./settings' as any)}
          >
            <Settings size={20} color="#101A3A" />
          </TouchableOpacity>
        </View>

        <PeriodSelector viewPeriod={viewPeriod} onPeriodChange={setViewPeriod} />

        <TabSelector activeTab={activeTab} onTabChange={setActiveTab} />

        <ChartCard
          activeTab={activeTab}
          chartData={chartData}
          total={total}
          netMarginPercent={netMarginPercent}
        />

        {activeTab === 'net' && (
          <NetMarginSummary
            incomeTotal={incomeTotal}
            expenseTotalWithTax={expenseTotalWithTax}
            viewPeriod={viewPeriod}
            getStreamPercent={getStreamPercent}
          />
        )}

        {activeTab !== 'net' && chartData.length > 0 && (
          <StreamsList
            activeTab={activeTab}
            streams={currentStreams}
            viewPeriod={viewPeriod}
            taxAmount={taxAmount}
            taxColor={taxColor}
            incomeColorMap={incomeColorMap}
            expenseColorMap={expenseColorMap}
            getConvertedAmount={getConvertedAmount}
            getStreamPercent={getStreamPercent}
            onEdit={handleEditStream}
            onDelete={handleDeleteStream}
            onTaxPress={() => setShowTaxAllocationSheet(true)}
          />
        )}
      </ScrollView>

      <FloatingAddButton
        visible={activeTab !== 'net'}
        onPress={handleOpenModal}
      />

      <AddStreamModal
        visible={isModalVisible}
        activeTab={activeTab}
        editingStreamId={editingStreamId}
        streamName={newStreamName}
        streamAmount={newStreamAmount}
        streamPeriod={newStreamPeriod}
        onNameChange={setNewStreamName}
        onAmountChange={setNewStreamAmount}
        onPeriodChange={setNewStreamPeriod}
        onSave={handleAddStream}
        onClose={handleCloseModal}
      />

      <DeleteDialog
        visible={isDeleteDialogVisible}
        activeTab={activeTab}
        streamName={streamToDelete?.name || null}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Tax Allocation Sheet */}
      <TaxAllocationSheet
        visible={showTaxAllocationSheet}
        onClose={() => setShowTaxAllocationSheet(false)}
      />
    </View>
  );
}