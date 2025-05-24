'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import './YesNoWheel.css';
import { useTranslations } from 'next-intl';

// Interface for individual items on the wheel
export interface WheelSliceItem {
  text: string;
  value?: any; // 现在是可选的
  message?: string; // 现在是可选的
  background?: string; // 现在是可选的
  probability?: number; // Optional: 0 to 1, for weighted selection
  resultIcon?: 'success' | 'error' | 'warning' | 'info' | 'question'; // Optional: Swal icon
  resultTitle?: string; // Optional: Swal title
}

// Props for the YesNoWheel component
interface YesNoWheelProps {
  customItems: WheelSliceItem[];
  sliceRepeats?: number; // How many times to repeat the customItems set on the wheel, default 1. Used if showControls is false.
  onSpinComplete?: (result: WheelSliceItem) => void; // Callback when spin finishes
  showControls?: boolean; // Whether to show the right-side controls (counts, repeat buttons). Defaults to true.
  initialSliceRepeats?: number; // Initial number of repeats for internal controls if showControls is true. Defaults to 3.
}

declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

export default function YesNoWheel(props: YesNoWheelProps) {
  const { 
    customItems, 
    sliceRepeats = 1, 
    onSpinComplete,
    showControls = true, 
    initialSliceRepeats = 3 
  } = props;
  
  const wheelResultRef = useRef<WheelSliceItem | null>(null);
  const [jQueryLoaded, setJQueryLoaded] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const isSpinning = useRef(false);
  const superWheelRef = useRef<any>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // 添加用于跟踪旋转ID的refs
  const currentSpinIdRef = useRef(0);
  const lastProcessedSpinIdRef = useRef(-1);

  // 使用动态对象来存储各选项的计数
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [activeSliceRepeats, setActiveSliceRepeats] = useState(showControls ? initialSliceRepeats : sliceRepeats);

  // 创建一个映射，存储每个选项对应的背景色
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    const colors: string[] = [];
    for (let i = 1; i <= 10; i++) {
      colors.push(`var(--wheel-color${i})`);
    }

    if (customItems && customItems.length > 0) {
      customItems.forEach((item, index) => {
        const key = String(item.value || item.text).toLowerCase();
        map[key] = item.background || colors[index % colors.length];
      });
    }
    return map;
  }, [customItems]);

  // 初始化计数器
  useEffect(() => {
    if (customItems && customItems.length > 0) {
      // 获取所有唯一的value值，如果没有value则使用text
      const uniqueValues = Array.from(new Set(
        customItems.map(item => String(item.value || item.text).toLowerCase())
      ));
      
      // 初始化计数器对象
      const initialCounters: Record<string, number> = {};
      uniqueValues.forEach(value => {
        initialCounters[value] = 0;
      });
      
      // 设置计数器状态
      setCounters(initialCounters);
    }
  }, [customItems]);

  // Store onSpinComplete in a ref to keep initializeWheel stable if onSpinComplete changes (though parent should memoize it)
  const onSpinCompleteRef = useRef(onSpinComplete);
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  // Ref to hold the latest props and state setters for the stable onComplete handler
  const latestPropsAndStateRef = useRef({
    customItems,
    showControls,
    setCounters, // 使用单一的setter来更新所有计数器
    onSpinCompleteRef
  });

  useEffect(() => {
    latestPropsAndStateRef.current = {
      customItems,
      showControls,
      setCounters,
      onSpinCompleteRef
    };
  }, [customItems, showControls, onSpinCompleteRef]); // Dependencies: things that the stable handler needs access to

  // Update activeSliceRepeats if props change
  useEffect(() => {
    if (showControls) {
      setActiveSliceRepeats(initialSliceRepeats);
    } else {
      setActiveSliceRepeats(sliceRepeats);
    }
  }, [showControls, initialSliceRepeats, sliceRepeats]);

  useEffect(() => {
    if (!window.jQuery) {
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
      jqueryScript.async = true;
      jqueryScript.onload = () => setJQueryLoaded(true);
      document.body.appendChild(jqueryScript);
    } else {
      setJQueryLoaded(true);
    }
    tickAudioRef.current = new Audio('/sounds/wheel-tick.mp3');

    return () => {
      if (tickAudioRef.current) {
        tickAudioRef.current.pause();
        tickAudioRef.current = null;
      }
      const $ = window.jQuery;
      if ($ && wheelRef.current && $(wheelRef.current).data('superWheel')) {
        try { $(wheelRef.current).superWheel('destroy'); } catch (e) { console.warn("Failed to destroy wheel on unmount", e); }
      }
    };
  }, []);

  const selectItemByProbability = useCallback((itemsToSelectFrom: WheelSliceItem[]): WheelSliceItem | null => {
    
    // 检查是否有带概率的选项
    const itemsWithProbs = itemsToSelectFrom.filter(item => 
      typeof item.probability === 'number' && item.probability > 0
    );
    
    // 如果没有带概率的选项，则等概率随机选择
    if (itemsWithProbs.length === 0) {
      if (itemsToSelectFrom.length === 0) return null;
      
      const randomIndex = Math.floor(Math.random() * itemsToSelectFrom.length);
      return itemsToSelectFrom[randomIndex];
    }
    
    // 基于概率权重选择
    const totalProbability = itemsWithProbs.reduce((sum, item) => 
      sum + (typeof item.probability === 'number' ? item.probability : 0), 0
    );
    
    // 生成0-1之间的随机数
    const randomRoll = Math.random();
    
    // 累计概率，找到命中的区间
    let accumulatedProb = 0;
    for (const item of itemsWithProbs) {
      accumulatedProb += (item.probability || 0);
      
      // 如果随机数小于等于累计概率，则选中当前项
      if (randomRoll <= accumulatedProb) {
        return item;
      }
    }
    
    // 如果没有选中任何项（浮点数精度问题可能导致），则选择最后一个有概率的项
    return itemsWithProbs.length > 0 ? itemsWithProbs[itemsWithProbs.length - 1] : null;
  }, []);

  // 增加防抖引用，防止多次快速点击
  const lastClickTimeRef = useRef<number>(0);
  
  const handleSpin = useCallback(() => {
    const $ = window.jQuery;
    if (!$ || !wheelRef.current || isSpinning.current || !customItems || customItems.length === 0) return;
    
    // 添加点击防抖，避免快速多次点击
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500) { // 500ms内不允许再次点击
      return;
    }
    lastClickTimeRef.current = now;
    
    isSpinning.current = true;
    
    // 为每次旋转分配一个新的ID
    currentSpinIdRef.current += 1;
    
    let targetItem: WheelSliceItem | null = selectItemByProbability(customItems);
    if (targetItem) {
      try {
        $(wheelRef.current).superWheel('start', 'value', targetItem.value || targetItem.text);
        $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', true);
      } catch (error) {
        console.error('启动转盘时出错:', error);
        // 出错时重置旋转状态，确保用户可以重试
        isSpinning.current = false;
        $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', false);
      }
    } else {
      console.error("Could not determine target item to spin to.");
      isSpinning.current = false;
      $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', false);
    }
  }, [customItems, selectItemByProbability]);

  // Add internationalization
  const t = useTranslations('Home.Wheel');

  // 重新实现的旋转完成处理函数，使用旋转ID跟踪机制
  const handleSuperWheelComplete = useCallback((superWheelRawResult: { value: any; }) => {
    // 获取当前旋转ID
    const spinId = currentSpinIdRef.current;
    
    // 如果已经处理过这个旋转，直接返回
    if (spinId <= lastProcessedSpinIdRef.current) {
      return;
    }
    
    // 标记这个旋转已经处理过
    lastProcessedSpinIdRef.current = spinId;
    
    const {
      customItems: currentCustomItems,
      showControls: currentShowControls,
      setCounters: currentSetCounters,
      onSpinCompleteRef: currentOnSpinCompleteRef
    } = latestPropsAndStateRef.current;

    // 标准化自定义项目，以便查找时考虑到text可能作为value的情况
    const normalizedItems = currentCustomItems.map(item => ({
      ...item,
      value: item.value || item.text // 确保value存在
    }));
    
    let winningItem = normalizedItems.find(item => item.value === superWheelRawResult.value);
    
    // 如果找不到匹配项，尝试在原始选项中查找
    if (!winningItem) {
      winningItem = normalizedItems.find(item => 
        String(item.value).toLowerCase() === String(superWheelRawResult.value).toLowerCase()
      );
    }
    
    if (winningItem) {
      // 确保winningItem拥有所有必要的属性
      const completeWinningItem = {
        text: winningItem.text,
        value: winningItem.value || winningItem.text,
        message: winningItem.message || `Your result is ${winningItem.text}`,
        background: winningItem.background || 'var(--wheel-color1)',
        resultIcon: winningItem.resultIcon || 'info',
        resultTitle: winningItem.resultTitle || winningItem.text
      };
      
      wheelResultRef.current = completeWinningItem;
      
      if (currentOnSpinCompleteRef.current) {
        currentOnSpinCompleteRef.current(completeWinningItem);
      }
      
      if (currentShowControls) {
        const valStr = String(completeWinningItem.value).toLowerCase();
        currentSetCounters(prev => {
          // 如果该选项不在计数器中，先添加它
          if (!(valStr in prev)) {
            return { ...prev, [valStr]: 1 };
          }
          // 否则增加现有计数
          return { ...prev, [valStr]: prev[valStr] + 1 };
        });
      }
      
      Swal.fire({ 
        icon: (completeWinningItem.resultIcon || 'info') as any, 
        title: completeWinningItem.resultTitle || 'Result!', 
        text: completeWinningItem.message, 
        width: window.innerWidth < 768 ? '85%' : '32em', 
        confirmButtonText: t('popup.OK'), 
        heightAuto: true, 
        customClass: { 
          popup: 'wheel-popup', 
          title: 'wheel-popup-title', 
          htmlContainer: 'wheel-popup-content', 
          confirmButton: 'wheel-popup-button' 
        }
      });
    } else { 
      console.error(`Winning value ${superWheelRawResult.value} not found.`); 
    }
    
    // 重置旋转状态
    isSpinning.current = false;
    
    // 确保按钮可用
    if (wheelRef.current && window.jQuery) { 
      try {
        const $ = window.jQuery;
        $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', false);
      } catch (error) {
        console.error('重置按钮状态时出错:', error);
      }
    }
  }, []); // EMPTY DEPS: This function reference is STABLE

  // 准备转盘切片数据
  const prepareWheelSlices = useCallback((items: WheelSliceItem[], repeats: number) => {
    // 获取可用的背景颜色总数
    const getAvailableColors = () => {
      const colors: string[] = [];
      for (let i = 1; i <= 10; i++) {
        colors.push(`var(--wheel-color${i})`);
      }
      return colors;
    };
    
    // 安全地访问数组元素的辅助函数
    const safeGet = <T,>(arr: T[], index: number): T | undefined => {
      return index >= 0 && index < arr.length ? arr[index] : undefined;
    };
    
    const colors = getAvailableColors();
    
    // 处理概率计算
    const processedItems = [...items]; // 复制一份以免修改原始数据
    
    // 扫描一遍，检查是否存在累积概率超过1的情况
    let cumulativeProbability = 0;
    let cutoffIndex = -1; // 超过概率1的截断点
    
    // 第一遍扫描，找出截断点
    for (let i = 0; i < processedItems.length; i++) {
      const item = safeGet(processedItems, i);
      if (item && typeof item.probability === 'number' && item.probability > 0) {
        cumulativeProbability += item.probability;
        
        // 如果累计概率超过1，记录截断点
        if (cumulativeProbability >= 0.9999 && cutoffIndex === -1) { // 使用0.9999避免浮点精度问题
          cutoffIndex = i;
        }
      }
    }
    
    // 如果找到了截断点，将截断点之后的所有选项概率设为0
    if (cutoffIndex !== -1) {
      for (let i = cutoffIndex + 1; i < processedItems.length; i++) {
        const item = safeGet(processedItems, i);
        if (item) {
          item.probability = 0;
        }
      }
      
      // 如果前几项概率总和超过1，需要进行缩放以确保总和为1
      if (cumulativeProbability > 1.0001) { // 容忍一点浮点误差
        let sumBeforeCutoff = 0;
        
        // 计算截断点及之前的概率总和
        for (let i = 0; i <= cutoffIndex; i++) {
          const item = safeGet(processedItems, i);
          if (item && typeof item.probability === 'number') {
            sumBeforeCutoff += item.probability;
          }
        }
        
        // 按比例缩放截断点及之前的概率
        for (let i = 0; i <= cutoffIndex; i++) {
          const item = safeGet(processedItems, i);
          if (item && typeof item.probability === 'number' && item.probability > 0) {
            item.probability = item.probability / sumBeforeCutoff;
          }
        }
      }
    } else if (cumulativeProbability > 0) {
      // 有概率值但总和未达到1的情况
      if (Math.abs(cumulativeProbability - 1) < 0.0001) {
        // 概率总和约等于1，将未指定概率的项设为0
        processedItems.forEach(item => {
          if (typeof item.probability !== 'number') {
            item.probability = 0;
          }
        });
      } else if (cumulativeProbability < 1) {
        // 概率总和小于1，最后一个有概率的选项补充剩余概率
        let lastProbIndex = -1;
        for (let i = processedItems.length - 1; i >= 0; i--) {
          const item = safeGet(processedItems, i);
          if (item && typeof item.probability === 'number' && item.probability > 0) {
            lastProbIndex = i;
            break;
          }
        }
        
        if (lastProbIndex !== -1) {
          const remainingProb = 1 - cumulativeProbability;
          const lastItem = safeGet(processedItems, lastProbIndex);
          if (lastItem) {
            lastItem.probability = (lastItem.probability || 0) + remainingProb;
          }
        }
        
        // 将未指定概率的项设为0
        processedItems.forEach(item => {
          if (typeof item.probability !== 'number') {
            item.probability = 0;
          }
        });
      } else {
        // 概率总和大于1但没有找到截断点的情况（理论上不应该发生）
        processedItems.forEach(item => {
          if (typeof item.probability === 'number' && item.probability > 0) {
            item.probability = item.probability / cumulativeProbability;
          } else {
            item.probability = 0;
          }
        });
      }
    } else {
      // 无概率值的情况，均等分配
      const equalProb = 1 / processedItems.length;
      processedItems.forEach(item => {
        item.probability = equalProb;
      });
    }
  
    
    // 标准化项目数据，填充缺失的属性
    const normalizedItems = processedItems.map((item, index) => {
      return {
        text: item.text,
        value: item.value || item.text, // 如果没有value，使用text
        message: item.message || `Your result is ${item.text}`, // 如果没有message，使用默认消息
        background: item.background || colors[index % colors.length], // 如果没有背景色，使用颜色循环
        probability: item.probability,
        resultIcon: item.resultIcon || 'info', // 如果没有图标，使用info
        resultTitle: item.resultTitle || item.text // 如果没有标题，使用text
      };
    });
    
    // 根据重复次数创建最终数组
    let finalSlices: WheelSliceItem[] = [];
    for (let i = 0; i < repeats; i++) {
      finalSlices = finalSlices.concat(normalizedItems);
    }
    
    return finalSlices;
  }, []);

  // 完全重构转盘初始化逻辑
  useEffect(() => {
    if (!jQueryLoaded || !window.jQuery || !wheelRef.current || !customItems || customItems.length === 0) {
      return;
    }
    
    const $ = window.jQuery;

    // 清理函数 - 确保彻底清除所有事件和数据
    const cleanupWheel = () => {
      if (!wheelRef.current) return;
      
      const $ = window.jQuery;
      if (!$) return;
      
      // 移除所有事件处理程序并销毁SuperWheel实例
      try {
        // 解绑所有按钮事件
        $(document).off('click', '.wheel-horizontal-spin-button');
        $(document).off('click', '#wheel-spin-button');
        $('.wheel-horizontal-spin-button', wheelRef.current).off('click');
        $('#wheel-spin-button', wheelRef.current).off('click');
        $(wheelRef.current).find('.wheel-horizontal-spin-button').off('click');
        $(wheelRef.current).find('#wheel-spin-button').off('click');
        
        // 移除所有jQuery事件
        $(wheelRef.current).off(); 
        
        // 销毁SuperWheel实例
        if ($(wheelRef.current).data('superWheel')) {
          $(wheelRef.current).superWheel('destroy');
        }
        
        // 重置内部状态
        isSpinning.current = false;
        
        // 清空DOM
        $(wheelRef.current).empty();
      } catch (e) {
        console.error("Error during wheel cleanup:", e);
      }
    };
    
    // 先清理现有的转盘
    cleanupWheel();
    
    // 准备转盘切片数据
    const currentRepeats = showControls ? activeSliceRepeats : sliceRepeats;
    // 使用新的prepareWheelSlices函数替代原来的重复逻辑
    const wheelSlices = prepareWheelSlices(customItems, currentRepeats);
    
    // 确保我们有数据再继续
    if (wheelSlices.length === 0) {
      return;
    }
    
    // 初始化SuperWheel脚本
    const initSuperWheel = () => {
      if (!wheelRef.current) return;
      
      const $ = window.jQuery;
      
      try {
        // 创建新的SuperWheel实例
        superWheelRef.current = $(wheelRef.current).superWheel({
          slices: wheelSlices.map(s => ({ 
            text: s.text, 
            value: s.value, 
            message: s.message, 
            background: s.background 
          })),
          text: { 
            color: '#ffffff', 
            offset: 8,           // 减小offset值，让文字位置更靠近外圈中心
            letterSpacing: 0, 
            orientation: 'v',    // 垂直方向文本
            size: 22,            // 增大文字尺寸为22px
            align: 'center',     // 文本居中对齐
            arc: true,           // 将arc设为true，使文字沿着扇形弧线排列
            rotate: true,        // 将rotate设为true，让文字方向跟随扇形
            margin: 10           // 增加margin使文字与边缘保持更多距离
          },
          slice: { selected: { background: "var(--wheel-color1)" } },
          line: { width: 4, color: "var(--wheel-line-color)" },
          outer: { width: 8, color: "var(--wheel-line-color)" },
          inner: { width: 10, color: "var(--wheel-line-color)" },
          marker: { background: "var(--wheel-line-color)" },
          selector: "value", 
          duration: 6000, 
          easing: 'easeOutQuad', 
          rotates: 8, 
          frame: 6, 
          type: 'rotate', 
          enable_swing: true, 
          swing_speed: 0.2, 
          swing_tick: 5
        });
        
        // 注册事件处理程序
        $(wheelRef.current).superWheel('onStart', function() { 
          if (tickAudioRef.current) {
            tickAudioRef.current.play().catch(e => console.error("Audio play error:", e));
          }
        });
        
        $(wheelRef.current).superWheel('onStep', function() { 
          if (tickAudioRef.current) {
            tickAudioRef.current.currentTime = 0;
            tickAudioRef.current.play().catch(e => console.error("Audio play error:", e));
          }
        });
        
        // 重要 - 只注册一次完成事件
        $(wheelRef.current).superWheel('onComplete', handleSuperWheelComplete);
        
        // 添加中心按钮
        $('.sWheel-center', wheelRef.current).html(`
          <button type="button" class="button button-primary wheel-horizontal-spin-button" id="wheel-spin-button">
            <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512">
              <path d="M256 96c38.4 0 73.7 13.5 101.3 36.1l-32.6 32.6c-4.6 4.6-5.9 11.5-3.5 17.4s8.3 9.9 14.8 9.9H448c8.8 0 16-7.2 16-16V64c0-6.5-3.9-12.3-9.9-14.8s-12.9-1.1-17.4 3.5l-34 34C363.4 52.6 312.1 32 256 32c-10.9 0-21.5 .8-32 2.3V99.2c10.3-2.1 21-3.2 32-3.2zM132.1 154.7l32.6 32.6c4.6 4.6 11.5 5.9 17.4 3.5s9.9-8.3 9.9-14.8V64c0-8.8-7.2-16-16-16H64c-6.5 0-12.3 3.9-14.8 9.9s-1.1 12.9 3.5 17.4l34 34C52.6 148.6 32 199.9 32 256c0 10.9 .8 21.5 2.3 32H99.2c-2.1-10.3-3.2-21-3.2-32c0-38.4 13.5-73.7 36.1-101.3zM477.7 224H412.8c2.1 10.3 3.2 21 3.2 32c0 38.4-13.5 73.7-36.1 101.3l-32.6-32.6c-4.6-4.6-11.5-5.9-17.4-3.5s-9.9 8.3-9.9 14.8V448c0 8.8 7.2 16 16 16H448c6.5 0 12.3-3.9 14.8-9.9s1.1-12.9-3.5-17.4l-34-34C459.4 363.4 480 312.1 480 256c0-10.9-.8-21.5-2.3-32zM256 416c-38.4 0-73.7-13.5-101.3-36.1l32.6-32.6c4.6-4.6 5.9-11.5 3.5-17.4s-8.3-9.9-14.8-9.9H64c-8.8 0-16 7.2-16 16l0 112c0 6.5 3.9 12.3 9.9 14.8s12.9 1.1 17.4-3.5l34-34C148.6 459.4 199.9 480 256 480c10.9 0 21.5-.8 32-2.3V412.8c-10.3 2.1-21 3.2-32 3.2z"/>
            </svg>
          </button>
        `);
        
        // 添加标记
        if ($('.sWheel-marker', wheelRef.current).length === 0) {
          $(wheelRef.current).append(`
            <div class="sWheel-marker">
              <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 80 115" style="enable-background:new 0 0 80 115;" xml:space="preserve">
                <g>
                  <path fill="#8B0000" d="M40,0C17.9,0,0,17.7,0,39.4S40,115,40,115s40-53.9,40-75.6S62.1,0,40,0z M40,52.5c-7,0-12.6-5.6-12.6-12.4 S33,27.7,40,27.7s12.6,5.6,12.6,12.4C52.6,46.9,47,52.5,40,52.5z"></path>
                  <path fill="rgba(0, 0, 0, 0.3)" d="M40,19.2c-11.7,0-21.2,9.3-21.2,20.8S28.3,60.8,40,60.8S61.2,51.5,61.2,40S51.7,19.2,40,19.2z M40,52.5 c-7,0-12.6-5.6-12.6-12.4S33,27.7,40,27.7s12.6,5.6,12.6,12.4C52.6,46.9,47,52.5,40,52.5z"></path>
                </g>
              </svg>
            </div>
          `);
        }
        
        // 直接绑定点击事件到按钮，而不是通过document委托
        // 先移除所有现有的事件绑定
        $(document).off('click', '.wheel-horizontal-spin-button');
        $(document).off('click', '#wheel-spin-button');
        $(wheelRef.current).find('.wheel-horizontal-spin-button').off('click');
        
        // 使用更可靠的方式绑定点击事件
        const spinButton = $(wheelRef.current).find('#wheel-spin-button');
        if (spinButton.length) {
          spinButton.on('click', function(e: MouseEvent) {
            e.preventDefault();
            e.stopPropagation();
            if (!isSpinning.current) {
              handleSpin();
            } else {
              console.log('ignore click');
            }
          });
          
        } else {
          console.error('找不到转盘按钮元素');
        }
        
      } catch (error) {
        console.error("Error initializing wheel:", error);
      }
    };
    
    // 如果SuperWheel脚本未加载，则加载它
    if (!document.querySelector('script[src="/js/jquery.superwheel.js"]')) {
      const script = document.createElement('script');
      script.src = '/js/jquery.superwheel.js';
      script.async = true;
      script.onload = initSuperWheel;
      document.body.appendChild(script);
    } else {
      initSuperWheel();
    }
    
    // 清理函数
    return () => {
      cleanupWheel();
    };
  }, [jQueryLoaded, customItems, showControls, sliceRepeats, activeSliceRepeats, handleSpin]); // handleSuperWheelComplete是稳定的，不需要添加到依赖列表中

  // Handler for changing slice repeats via buttons
  const handleSetSliceRepeats = (count: number) => {
    if (!showControls) return;
    setActiveSliceRepeats(count);
  };

  return (
    <div className="wheel_wrapper_main">
      <div ref={wheelRef} className="wheel-horizontal"></div>
      {showControls && (
        <div className="right">
          <div className="tries">
            {Object.entries(counters).map(([value, count]) => (
              <span 
                key={value} 
                className={`counter-${value}`} 
                data-label={value.toUpperCase()}
                style={{
                  color: colorMap[value] || 'var(--wheel-color1)', 
                  borderBottom: `3px solid ${colorMap[value] || 'var(--wheel-color1)'}`
                }}
              >
                {count}
              </span>
            ))}
          </div>
          
          <div className="no_of_items">
            <h2>{t('NumberOfItems')}</h2>
            <div className="items">
              <button onClick={() => handleSetSliceRepeats(1)}>{t('buttons.ONE')}</button>
              <button onClick={() => handleSetSliceRepeats(2)}>{t('buttons.TWO')}</button>
              <button onClick={() => handleSetSliceRepeats(3)}>{t('buttons.THREE')}</button>
              <button onClick={() => handleSetSliceRepeats(4)}>{t('buttons.FOUR')}</button>
              <button onClick={() => handleSetSliceRepeats(5)}>{t('buttons.FIVE')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 