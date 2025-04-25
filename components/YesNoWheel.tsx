'use client';

import { useEffect, useState, useRef } from 'react';
import Swal from 'sweetalert2';
import './YesNoWheel.css';

interface WheelItem {
  text: string;
  value: number;
  message: string;
  background: string;
}

declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

export default function YesNoWheel() {
  const [wheelResult, setWheelResult] = useState<{ value: number; message: string } | null>(null);
  const [yesCount, setYesCount] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [maybeCount, setMaybeCount] = useState(0);
  const [showMaybe, setShowMaybe] = useState(false);
  const [items, setItems] = useState(3);
  const [jQueryLoaded, setJQueryLoaded] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const isSpinning = useRef(false);
  const superWheelRef = useRef<any>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const celebrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const itemsRef = useRef(3); // 用于跟踪items的实际值

  useEffect(() => {
    const loadJQuery = async () => {
      if (window.jQuery) {
        setJQueryLoaded(true);
        return;
      }

      try {
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
        jqueryScript.async = true;
        jqueryScript.onload = () => {
          setJQueryLoaded(true);
        };
        document.body.appendChild(jqueryScript);
      } catch (error) {
        console.error('Error loading jQuery:', error);
      }
    };

    loadJQuery();

    tickAudioRef.current = new Audio('/sounds/wheel-tick.mp3');

    return () => {
      if (tickAudioRef.current) {
        tickAudioRef.current.pause();
        tickAudioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (jQueryLoaded) {
      const loadSuperWheel = async () => {
        try {
          const script = document.createElement('script');
          script.src = '/js/jquery.superwheel.js';
          script.async = true;
          document.body.appendChild(script);

          script.onload = () => {
            initializeWheel();
          };
        } catch (error) {
          console.error('Error loading superWheel:', error);
        }
      };

      loadSuperWheel();
    }
    
    return () => {
      const superWheelScript = document.querySelector('script[src="/js/jquery.superwheel.js"]');
      if (superWheelScript) {
        superWheelScript.remove();
      }
    };
  }, [jQueryLoaded]);

  // 更新 itemsRef 当 items 变化时
  useEffect(() => {
    itemsRef.current = items;
    console.log("Items updated to:", items);
  }, [items]);

  // 当 items 或 showMaybe 变化时重新初始化轮盘
  useEffect(() => {
    if (window.jQuery && wheelRef.current && jQueryLoaded) {
      console.log("Reinitializing wheel with items:", items);
      initializeWheel();
    }
  }, [showMaybe, items, jQueryLoaded]);

  const initializeWheel = () => {
    const $ = window.jQuery;
    if (!$ || !wheelRef.current) {
      console.error("jQuery or wheelRef not available");
      return;
    }

    const currentItems = itemsRef.current;
    console.log("Initializing wheel with items:", currentItems);

    let result: WheelItem[] = [];
    

    const obj: WheelItem[] = [
      {
        text: "YES",
        value: 1,
        message: "Go for it!",
        background: "var(--wheel-color1)"
      },
      {
        text: "NO",
        value: 0,
        message: "You may need to consider not doing it!",
        background: "var(--wheel-color2)"
      }
    ];

    for (let i = 0; i < currentItems; i++) {
      result = [...result, ...obj];
    }


    try {
      // 如果已有实例，则销毁旧实例，清除旧回调
      if ($(wheelRef.current).data('superWheel')) {
        try {
          $(wheelRef.current).superWheel('destroy');
        } catch (e) {
          console.error("Error destroying previous wheel instance:", e);
        }
      }

      console.log("Creating new wheel with", result.length, "slices");
      superWheelRef.current = $(wheelRef.current).superWheel({
        slices: result,
        text: {
          color: '#ffffff',
          offset: 11,
          letterSpacing: 0,
          orientation: 'v',
          size: 16,
          align: 'center',
          arc: false,
          rotate: false
        },
        slice: {
          selected: { background: "var(--wheel-color1)" }
        },
        line: {
          width: 4,
          color: "var(--wheel-line-color)"
        },
        outer: {
          width: 8,
          color: "var(--wheel-line-color)"
        },
        inner: {
          width: 10,
          color: "var(--wheel-line-color)"
        },
        marker: {
          background: "var(--wheel-line-color)"
        },
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

      $(wheelRef.current).superWheel('onStart', function() {
        try {
          if (tickAudioRef.current) {
            tickAudioRef.current.play().catch(error => {
              console.error('Error playing tick sound:', error);
            });
          }
        } catch (error) {
          console.error('Error playing tick sound:', error);
        }
      });

      $(wheelRef.current).superWheel('onStep', function() {
        try {
          if (tickAudioRef.current) {
            if (typeof tickAudioRef.current.currentTime !== 'undefined') {
              tickAudioRef.current.currentTime = 0;
            }
            tickAudioRef.current.play().catch(error => {
              console.error('Error playing tick sound:', error);
            });
          }
        } catch (error) {
          console.error('Error playing tick sound:', error);
        }
      });

      // 仅在转盘完成时设置结果并播放音效
      $(wheelRef.current).superWheel('onComplete', (results: { value: number; message: string }) => {
        setWheelResult(results);
        isSpinning.current = false;
      });

      $('.sWheel-center', wheelRef.current).html(`
        <button type="button" class="button button-primary wheel-horizontal-spin-button">
          <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 512 512">
            <path d="M256 96c38.4 0 73.7 13.5 101.3 36.1l-32.6 32.6c-4.6 4.6-5.9 11.5-3.5 17.4s8.3 9.9 14.8 9.9H448c8.8 0 16-7.2 16-16V64c0-6.5-3.9-12.3-9.9-14.8s-12.9-1.1-17.4 3.5l-34 34C363.4 52.6 312.1 32 256 32c-10.9 0-21.5 .8-32 2.3V99.2c10.3-2.1 21-3.2 32-3.2zM132.1 154.7l32.6 32.6c4.6 4.6 11.5 5.9 17.4 3.5s9.9-8.3 9.9-14.8V64c0-8.8-7.2-16-16-16H64c-6.5 0-12.3 3.9-14.8 9.9s-1.1 12.9 3.5 17.4l34 34C52.6 148.6 32 199.9 32 256c0 10.9 .8 21.5 2.3 32H99.2c-2.1-10.3-3.2-21-3.2-32c0-38.4 13.5-73.7 36.1-101.3zM477.7 224H412.8c2.1 10.3 3.2 21 3.2 32c0 38.4-13.5 73.7-36.1 101.3l-32.6-32.6c-4.6-4.6-11.5-5.9-17.4-3.5s-9.9 8.3-9.9 14.8V448c0 8.8 7.2 16 16 16H448c6.5 0 12.3-3.9 14.8-9.9s1.1-12.9-3.5-17.4l-34-34C459.4 363.4 480 312.1 480 256c0-10.9-.8-21.5-2.3-32zM256 416c-38.4 0-73.7-13.5-101.3-36.1l32.6-32.6c4.6-4.6 5.9-11.5 3.5-17.4s-8.3-9.9-14.8-9.9H64c-8.8 0-16 7.2-16 16l0 112c0 6.5 3.9 12.3 9.9 14.8s12.9 1.1 17.4-3.5l34-34C148.6 459.4 199.9 480 256 480c10.9 0 21.5-.8 32-2.3V412.8c-10.3 2.1-21 3.2-32 3.2z"/>
          </svg>
        </button>
      `);

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

      // 确保移除之前的点击处理程序
      $(document).off('click', '.wheel-horizontal-spin-button');
      $(document).on('click', '.wheel-horizontal-spin-button', handleSpin);
      
      console.log("Wheel initialization complete");
    } catch (error) {
      console.error('Error initializing wheel:', error);
    }
  };

  const handleSpin = () => {
    const $ = window.jQuery;
    if (!$ || !wheelRef.current || isSpinning.current) return;

    isSpinning.current = true;
    const randomValue = Math.floor(Math.random() * (showMaybe ? 3 : 2));
    $(wheelRef.current).superWheel('start', 'value', randomValue);
    
    $('.wheel-horizontal-spin-button', wheelRef.current).prop('disabled', true);
  };

  const handleSetItems = (count: number) => {
    console.log("Setting items to:", count);
    setItems(count);
    
    // 直接更新 ref 确保能立即获取到最新值
    itemsRef.current = count;
    
    // 强制重新初始化转盘
    if (window.jQuery && wheelRef.current) {
      setTimeout(() => {
        console.log("Force reinitializing wheel with count:", count);
        initializeWheel();
      }, 50);
    }
  };

  // 在组件内部，初始化函数之后，添加副作用监听 wheelResult
  useEffect(() => {
    if (!wheelResult) return;
    const { value, message } = wheelResult;
    
    let icon: 'success' | 'error' | 'warning' | 'info' | 'question';
    let title: string;
    
    if (value === 1) {
      icon = 'success';
      title = 'Sure!';
    } else if (value === 2) {
      icon = 'question';
      title = 'Maybe!';
    } else {
      icon = 'info';
      title = 'Attention!';
    }
    
    // 根据结果弹窗
    Swal.fire({
      icon,
      title,
      text: message,
      width: window.innerWidth < 768 ? '85%' : '32em',
      confirmButtonText: 'OK',
      heightAuto: true,
      customClass: {
        popup: 'wheel-popup',
        title: 'wheel-popup-title',
        htmlContainer: 'wheel-popup-content',
        confirmButton: 'wheel-popup-button'
      }
    });
    
    // 单次计数
    if (value === 1) setYesCount(prev => prev + 1);
    else if (value === 2) setMaybeCount(prev => prev + 1);
    else setNoCount(prev => prev + 1);
    
    // 恢复按钮
    window.jQuery(wheelRef.current).find('.wheel-horizontal-spin-button').prop('disabled', false);
    
    // 重置结果
    setWheelResult(null);
  }, [wheelResult]);

  return (
    <div className="wheel_wrapper_main">
      <div ref={wheelRef} className="wheel-horizontal"></div>
      <div className="right">
        <div className="tries">
          <span className="yes">{yesCount}</span>
          <span className="no">{noCount}</span>
        </div>
        <div className="no_of_items">
          <h2>Number of Items to Show</h2>
          <div className="items">
            <button onClick={() => handleSetItems(1)}>ONE</button>
            <button onClick={() => handleSetItems(2)}>TWO</button>
            <button onClick={() => handleSetItems(3)}>THREE</button>
            <button onClick={() => handleSetItems(4)}>FOUR</button>
            <button onClick={() => handleSetItems(5)}>FIVE</button>
          </div>
        </div>
      </div>
    </div>
  );
} 