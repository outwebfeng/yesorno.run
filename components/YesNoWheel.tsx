'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Swal from 'sweetalert2';
import './YesNoWheel.css';

// Interface for individual items on the wheel
export interface WheelSliceItem {
  text: string;
  value: any; // Unique value for this slice
  message: string; // Message for Swal popup
  background: string; // Background color for the slice
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

  // State for right-side controls
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [activeSliceRepeats, setActiveSliceRepeats] = useState(showControls ? initialSliceRepeats : sliceRepeats);

  // Store onSpinComplete in a ref to keep initializeWheel stable if onSpinComplete changes (though parent should memoize it)
  const onSpinCompleteRef = useRef(onSpinComplete);
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);

  // Ref to hold the latest props and state setters for the stable onComplete handler
  const latestPropsAndStateRef = useRef({
    customItems,
    showControls,
    setYesCount, // setState actions are stable
    setNoCount,  // setState actions are stable
    onSpinCompleteRef,
    processedResultIds: new Set<string>() // 添加处理过的结果ID集合
  });

  useEffect(() => {
    latestPropsAndStateRef.current = {
      customItems,
      showControls,
      setYesCount,
      setNoCount,
      onSpinCompleteRef,
      processedResultIds: new Set<string>()
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
    const itemsWithProbs = itemsToSelectFrom.filter(item => typeof item.probability === 'number' && item.probability > 0);
    if (itemsWithProbs.length === 0) {
        const uniqueValues = Array.from(new Set(itemsToSelectFrom.map(item => item.value)));
        if (uniqueValues.length > 0) {
            const randomIndex = Math.floor(Math.random() * uniqueValues.length);
            const randomValue = uniqueValues[randomIndex];
            return itemsToSelectFrom.find(item => item.value === randomValue) || null;
        }
        return null;
    }
    const totalProbability = itemsWithProbs.reduce((sum, item) => sum + (item.probability!), 0);
    let randomRoll = Math.random() * totalProbability;
    for (const item of itemsWithProbs) {
      if (randomRoll < item.probability!) { return item; }
      randomRoll -= item.probability!;
    }
    return itemsWithProbs.length > 0 ? itemsWithProbs[itemsWithProbs.length - 1] : null;
  }, []);

  const handleSpin = useCallback(() => {
    const $ = window.jQuery;
    if (!$ || !wheelRef.current || isSpinning.current || !customItems || customItems.length === 0) return;
    isSpinning.current = true;
    
    // 为每次旋转分配一个新的ID
    currentSpinIdRef.current += 1;
    console.log(`开始新的旋转, 旋转ID: ${currentSpinIdRef.current}`);
    
    let targetItem: WheelSliceItem | null = selectItemByProbability(customItems);
    if (targetItem) {
      $(wheelRef.current).superWheel('start', 'value', targetItem.value);
      if(wheelRef.current) { $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', true); }
    } else {
      console.error("Could not determine target item to spin to.");
      isSpinning.current = false;
      if(wheelRef.current) { $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', false); }
    }
  }, [customItems, selectItemByProbability]);

  // 重新实现的旋转完成处理函数，使用旋转ID跟踪机制
  const handleSuperWheelComplete = useCallback((superWheelRawResult: { value: any; }) => {
    // 获取当前旋转ID
    const spinId = currentSpinIdRef.current;
    
    // 如果已经处理过这个旋转，直接返回
    if (spinId <= lastProcessedSpinIdRef.current) {
      console.log(`忽略重复的旋转完成事件，当前ID: ${spinId}, 已处理到: ${lastProcessedSpinIdRef.current}`);
      return;
    }
    
    // 标记这个旋转已经处理过
    lastProcessedSpinIdRef.current = spinId;
    console.log(`处理旋转完成事件，旋转ID: ${spinId}`);
    
    const {
      customItems: currentCustomItems,
      showControls: currentShowControls,
      setYesCount: currentSetYesCount,
      setNoCount: currentSetNoCount,
      onSpinCompleteRef: currentOnSpinCompleteRef
    } = latestPropsAndStateRef.current;

    const winningItem = currentCustomItems.find(item => item.value === superWheelRawResult.value);
    if (winningItem) {
      wheelResultRef.current = winningItem;
      if (currentOnSpinCompleteRef.current) {
        currentOnSpinCompleteRef.current(winningItem);
      }
      if (currentShowControls) {
        const valStr = String(winningItem.value).toLowerCase();
        console.log(`增加计数: ${valStr}`);
        if (valStr === 'yes') currentSetYesCount(prev => prev + 1);
        else if (valStr === 'no') currentSetNoCount(prev => prev + 1);
      }
      Swal.fire({ icon: (winningItem.resultIcon || 'info') as any, title: winningItem.resultTitle || 'Result!', text: winningItem.message, width: window.innerWidth < 768 ? '85%' : '32em', confirmButtonText: 'OK', heightAuto: true, customClass: { popup: 'wheel-popup', title: 'wheel-popup-title', htmlContainer: 'wheel-popup-content', confirmButton: 'wheel-popup-button' }});
    } else { console.error(`Winning value ${superWheelRawResult.value} not found.`); }
    isSpinning.current = false;
    if (wheelRef.current && window.jQuery) { window.jQuery(wheelRef.current).find('.wheel-horizontal-spin-button').prop('disabled', false); }
  }, []); // EMPTY DEPS: This function reference is STABLE

  // 完全重构转盘初始化逻辑
  useEffect(() => {
    if (!jQueryLoaded || !window.jQuery || !wheelRef.current || !customItems || customItems.length === 0) {
      return;
    }
    
    console.log("Main wheel useEffect: Cleaning up existing wheel...");
    const $ = window.jQuery;

    // 清理函数 - 确保彻底清除所有事件和数据
    const cleanupWheel = () => {
      if (!wheelRef.current) return;
      
      // 移除所有事件处理程序并销毁SuperWheel实例
      try {
        $(document).off('click', '.wheel-horizontal-spin-button');
        $(wheelRef.current).off(); // 移除所有jQuery事件
        
        if ($(wheelRef.current).data('superWheel')) {
          $(wheelRef.current).superWheel('destroy');
        }
        
        $(wheelRef.current).empty();
      } catch (e) {
        console.error("Error during wheel cleanup:", e);
      }
    };
    
    // 先清理现有的转盘
    cleanupWheel();
    
    // 准备转盘切片数据
    const currentRepeats = showControls ? activeSliceRepeats : sliceRepeats;
    let wheelSlices: WheelSliceItem[] = [];
    for (let i = 0; i < currentRepeats; i++) {
      wheelSlices = wheelSlices.concat(customItems);
    }
    
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
          text: { color: '#ffffff', offset: 11, letterSpacing: 0, orientation: 'v', size: 16, align: 'center', arc: false, rotate: false },
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
          <button type="button" class="button button-primary wheel-horizontal-spin-button">
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
        
        // 一次性注册按钮事件处理程序
        $(document).off('click', '.wheel-horizontal-spin-button').on('click', '.wheel-horizontal-spin-button', handleSpin);
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
            <span className="yes">{yesCount}</span>
            <span className="no">{noCount}</span>
          </div>
          <div className="no_of_items">
            <h2>Number of Items to Show</h2>
            <div className="items">
              <button onClick={() => handleSetSliceRepeats(1)}>ONE</button>
              <button onClick={() => handleSetSliceRepeats(2)}>TWO</button>
              <button onClick={() => handleSetSliceRepeats(3)}>THREE</button>
              <button onClick={() => handleSetSliceRepeats(4)}>FOUR</button>
              <button onClick={() => handleSetSliceRepeats(5)}>FIVE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 