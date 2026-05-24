/**
 * EA Premium Native Keyboard (FynGeez Style - Master Edition V4)
 * Features: Key Pop-up Effect, Auto-scroll Input, FynGeez Layout, Fast Response
 */

const EAKeyboard = {
    activeInput: null,
    isCaps: false,
    lastInsertedBase: null, 
    
    // የአማርኛ ፊደላት ቤተሰብ (Matrix)
    amharicMap: {
        "ሀ":"ሀሁሂሃሄህሆ", "ለ":"ለሉሊላሌልሎ", "ሐ":"ሐሑሒሓሔሕሖ", "መ":"መሙሚማሜምሞ", "ሠ":"ሠሡሢሣሤሥሦ", 
        "ረ":"ረሩሪራሬርሮ", "ሰ":"ሰሱሲሳሴስሶ", "ሸ":"ሸሹሺሻሼሽሾ", "ቀ":"ቀቁቂቃቄቅቆ", "በ":"በቡቢባቤብቦ", 
        "ተ":"ተቱቲታቴትቶ", "ቸ":"ቸቹቺቻቼችቾ", "ኀ":"ኀኁኂኃኄኅኆ", "ነ":"ነኑኒናኔንኖ", "ኘ":"ኘኙኚኛኜኝኞ", 
        "አ":"አኡኢኣኤእኦ", "ከ":"ከኩኪካኬክኮ", "ኸ":"ኸኹኺኻኼኽኾ", "ወ":"ወዉዊዋዌውዎ", "ዐ":"ዐዑዒዓዔዕዖ", 
        "ዘ":"ዘዙዚዛዜዝዞ", "ዠ":"ዠዡዢዣዤዥዦ", "የ":"የዩዪያዬይዮ", "ደ":"ደዱዲዳዴድዶ", "ጀ":"ጀጁጂጃጄጅጆ", 
        "ገ":"ገጉጊጋጌግጎ", "ጠ":"ጠጡጢጣጤጥጦ", "ጨ":"ጨጩጪጫጬጭጮ", "ጰ":"ጰጱጲጳጴጵጶ", "ጸ":"ጸጹጺጻጼጽጾ", 
        "ፀ":"ፀፁፂፃፄፅፆ", "ፈ":"ፈፉፊፋፌፍፎ", "ፐ":"ፐፑፒፓፔፕፖ", "ቨ":"ቨቩቪቫቬቭቮ"
    },

    init() {
        this.injectStyles();
        this.injectHTML();
        this.bindEvents();
        this.enforceCustomKeyboard();
    },

    injectStyles() {
        const css = `
        /* =========================================
           PREMIUM NATIVE KEYBOARD STYLES (Matches home.html)
           ========================================= */
        .ea-native-kb {
            position: fixed; bottom: -120%; left: 0; width: 100%;
            background: var(--surface, #1e1e1e); 
            backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px);
            z-index: 100000; transition: bottom 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
            display: flex; flex-direction: column; 
            font-family: 'Noto Sans Ethiopic', sans-serif;
            user-select: none; -webkit-user-select: none;
            padding-bottom: env(safe-area-inset-bottom);
            box-shadow: 0 -10px 30px rgba(0,0,0,0.4);
            border-top: 1px solid var(--border, rgba(255,255,255,0.1));
        }
        
        .ea-native-kb.active { bottom: 0; }

        /* Predictive / Variants Bar */
        .ea-kb-variants-bar {
            display: flex; gap: 5px; padding: 6px 8px;
            background: var(--bg, #121212);
            min-height: 50px; align-items: center; justify-content: space-between;
            border-bottom: 1px solid var(--border, rgba(0,0,0,0.2));
            overflow-x: auto; scrollbar-width: none;
        }
        .ea-kb-variants-bar::-webkit-scrollbar { display: none; }
        
        .variant-placeholder { 
            font-size: 14px; color: var(--text-sub, #888); font-weight: 600; 
            width: 100%; text-align: center;
        }

        .variant-key {
            flex: 1; height: 38px; min-width: 40px; border-radius: 8px;
            background: transparent; color: var(--primary, #ffd700); font-size: 22px; font-weight: 700;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: 0.1s;
        }
        .variant-key:active { background: var(--primary-glow, rgba(255, 215, 0, 0.2)); transform: scale(1.1); }

        /* Keyboard Body Area */
        .ea-kb-body { padding: 8px 4px 10px; display: none; background: transparent; }
        .ea-kb-body.active { display: block; }

        /* Standard Rows */
        .kb-row { display: flex; gap: 4px; justify-content: center; margin-bottom: 6px; width: 100%; }
        .kb-row.mid { width: 92%; margin: 0 auto 6px; }

        /* Standard Key Styling */
        .ea-key {
            flex: 1; background: var(--bg, #2c2c2e); color: var(--text-main, #ffffff);
            border-radius: 6px; font-size: 22px; font-weight: 500;
            display: flex; justify-content: center; align-items: center;
            height: 48px; cursor: pointer; position: relative;
            box-shadow: 0 1px 2px rgba(0,0,0,0.3); 
            transition: background 0.05s;
        }
        
        /* POP-UP EFFECT */
        .key-popout {
            display: none; position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%);
            background: var(--surface, #1e1e1e); color: var(--primary, #ffd700);
            padding: 10px 18px; border-radius: 12px; font-size: 30px; font-weight: 900;
            box-shadow: 0 10px 25px rgba(0,0,0,0.6); border: 2px solid var(--primary, #ffd700);
            z-index: 1000; pointer-events: none;
        }
        .key-popout::after {
            content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%);
            border-width: 8px; border-style: solid;
            border-color: var(--primary, #ffd700) transparent transparent transparent;
        }
        .ea-key.pressed { background: var(--primary-glow, rgba(255, 215, 0, 0.3)); }
        .ea-key.pressed .key-popout { display: flex; }

        /* Action Keys */
        .ea-key.action { background: var(--border, #3a3a3c); font-size: 18px; color: var(--text-main, #ffffff); }
        .ea-key.action.pressed { background: var(--primary, #ffd700); color: #000; }
        .ea-key.enter { background: var(--primary, #ffd700); color: #000; font-weight: 800; font-size: 15px; }
        .ea-key.wide { flex: 1.5; font-size: 18px; }
        
        /* Bottom Row Styling */
        .bottom-row { display: flex; gap: 4px; padding: 0 4px; height: 48px; }
        .bottom-row .ea-key { font-size: 15px; font-weight: 700; background: var(--border, #3a3a3c); }
        .bottom-row .ea-key.spacebar { flex: 4; background: var(--bg, #2c2c2e); font-size: 16px; }

        /* Emoji Grid */
        .grid-emo { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; height: 160px; overflow-y: auto; padding: 5px; }
        .grid-emo::-webkit-scrollbar { display: none; }
        .emoji-key { font-size: 26px; height: 45px; display: flex; align-items: center; justify-content: center; background: transparent; box-shadow: none; border-radius: 8px; }
        .emoji-key.pressed { background: rgba(255,255,255,0.1); transform: scale(1.2); }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    },

    injectHTML() {
        // 1. AMHARIC LAYOUT
        const amRow1=['፡','።','፣','፤','፥','፦','፧','፨','?']; // Added semicolon
         
        const amRow2 = ['ሀ','ለ','ሐ','መ','ሠ','ረ','ሰ','ሸ','ቀ','በ'];
        const amRow3 = ['ተ','ቸ','ኀ','ነ','ኘ','አ','ከ','ኸ','ወ','ዐ'];
        const amRow4 = ['ዘ','ዠ','የ','ደ','ጀ','ገ','ጠ','ጨ','ጰ','ጸ'];
        const amRow5 = ['ፀ','ፈ','ፐ','ቨ'];
        const genRow = (keys, cls="") => `<div class="kb-row ${cls}">${keys.map(k => `<div class="ea-key base-char" data-base="${k}">${k}<span class="key-popout">${k}</span></div>`).join('')}</div>`;

        let amHTML = genRow(amRow1) + genRow(amRow2) + genRow(amRow3);
        amHTML += `<div class="kb-row">
            <div class="ea-key action wide" data-action="toggleCaps"><i class="fas fa-arrow-up"></i></div>
            ${amRow4.map(k => `<div class="ea-key base-char" data-base="${k}">${k}<span class="key-popout">${k}</span></div>`).join('')}
            <div class="ea-key action wide" data-action="backspace"><i class="fas fa-delete-left"></i></div>
        </div>`;

        // 2. ENGLISH LAYOUT (QWERTY)
        // FIXED: Removed duplicate const enRow1 definition that caused the Syntax Error.
        const enRow1 = ['q','w','e','r','t','y','u','i','o','p']; 
        const enRow2 = ['a','s','d','f','g','h','j','k','l'];
        const enRow3 = ['z','x','c','v','b','n','m'];

        const genEnRow = (keys, cls="") => `<div class="kb-row ${cls}">${keys.map(k => `<div class="ea-key letter" data-val="${k}">${k}<span class="key-popout">${k.toUpperCase()}</span></div>`).join('')}</div>`;

        let enHTML = genEnRow(enRow1) + genEnRow(enRow2, "mid");
        enHTML += `<div class="kb-row">
            <div class="ea-key action wide" data-action="toggleCaps"><i class="fas fa-arrow-up"></i></div>
            ${enRow3.map(k => `<div class="ea-key letter" data-val="${k}">${k}<span class="key-popout">${k.toUpperCase()}</span></div>`).join('')}
            <div class="ea-key action wide" data-action="backspace"><i class="fas fa-delete-left"></i></div>
        </div>`;

        // 3. NUMBERS & SYMBOLS
        const numRow1 = ['1','2','3','4','5','6','7','8','9','0'];
        const numRow2 = ['@','#','$','_','&','-','+','(',')','/'];
        const numRow3 = ['*','"',"'",':',';','!','?','%','<','>'];

        const genNumRow = (keys) => `<div class="kb-row">${keys.map(k => `<div class="ea-key" data-val="${k}">${k}<span class="key-popout">${k}</span></div>`).join('')}</div>`;

        let numHTML = genNumRow(numRow1) + genNumRow(numRow2);
        numHTML += `<div class="kb-row">
            <div class="ea-key action wide" data-action="switchSym">=\\<</div>
            ${numRow3.map(k => `<div class="ea-key" data-val="${k}">${k}<span class="key-popout">${k}</span></div>`).join('')}
            <div class="ea-key action wide" data-action="backspace"><i class="fas fa-delete-left"></i></div>
        </div>`;

        // 4. EMOJIS
        const emojis = ['🙏','🕊️','📖','⛪','✝️','✨','🤍','😇','🙌','👑','🌟','🛡️','🌿','🔥','🍞','🍷','👼','🎶','❤️','🌍', '😊','😂','🥺','👏','🥰','😭','😎','🙏🏽','😍','😘','💪','🔥'];
        let emoHTML = '<div class="grid-emo">';
        emojis.forEach(e => emoHTML += `<div class="ea-key emoji-key" data-val="${e}">${e}</div>`);
        emoHTML += `</div>`;

        // BOTTOM CONTROLS
        const bottomControls = `
        <div class="bottom-row">
            <div class="ea-key action wide" data-action="switchNum">?123</div>
            <div class="ea-key action" data-action="switchLang"><i class="fas fa-globe"></i></div>
            <div class="ea-key action" data-action="switchEmo">😊</div>
            <div class="ea-key spacebar" data-action="space">Space</div>
            <div class="ea-key action" data-val=".">.</div>
            <div class="ea-key enter wide" data-action="enter">Enter</div>
            <div class="ea-key action" data-action="hide"><i class="fas fa-chevron-down"></i></div>
        </div>`;

        // MAIN WRAPPER
        const wrapper = `
        <div id="eaCustomKeyboard" class="ea-native-kb">
            <div id="ea-kb-variants-bar" class="ea-kb-variants-bar">
                <div class="variant-placeholder">መጀመሪያ ከታች ፊደል ይምረጡ</div>
            </div>
            
            <div id="kb-am" class="ea-kb-body active">${amHTML}</div>
            <div id="kb-en" class="ea-kb-body">${enHTML}</div>
            <div id="kb-num" class="ea-kb-body">${numHTML}</div>
            <div id="kb-emo" class="ea-kb-body">${emoHTML}</div>

            ${bottomControls}
        </div>`;

        document.body.insertAdjacentHTML('beforeend', wrapper);
    },

    bindEvents() {
        const kb = document.getElementById('eaCustomKeyboard');
        
        // Prevent loss of input focus
        kb.addEventListener('mousedown', e => e.preventDefault());

        // Fast Touch Events
        kb.addEventListener('touchstart', e => {
            const key = e.target.closest('.ea-key, .variant-key');
            if (key) {
                key.classList.add('pressed');
                this.vibrate();
            }
        }, {passive: true});

        kb.addEventListener('touchend', e => {
            const key = e.target.closest('.ea-key, .variant-key');
            document.querySelectorAll('.pressed').forEach(k => k.classList.remove('pressed'));
            if (key) {
                e.preventDefault(); 
                this.handleKeyPress(key);
            }
        });

        // Mouse Fallbacks
        kb.addEventListener('mousedown', e => {
            const key = e.target.closest('.ea-key, .variant-key');
            if (key) key.classList.add('pressed');
        });

        kb.addEventListener('mouseup', e => {
            const key = e.target.closest('.ea-key, .variant-key');
            document.querySelectorAll('.pressed').forEach(k => k.classList.remove('pressed'));
            if (key) this.handleKeyPress(key);
        });
    },

    handleKeyPress(key) {
        // Actions
        const action = key.getAttribute('data-action');
        if (action) {
            this.handleAction(action);
            return;
        }

        const val = key.getAttribute('data-val');
        const base = key.getAttribute('data-base');
        const variant = key.getAttribute('data-variant');

        if (base) {
            // Amharic Base Tap -> Type it immediately & show variants
            this.insertText(base);
            this.lastInsertedBase = base;
            this.showAmharicVariants(base);
        } else if (variant) {
            // Variant Tap -> Replace base if last typed, else insert
            if (this.lastInsertedBase) {
                this.handleAction('backspace'); 
                this.insertText(variant);
                this.lastInsertedBase = null; 
            } else {
                this.insertText(variant);
            }
        } else if (val) {
            // English / Numbers / Emojis
            let finalVal = val;
            if (this.isCaps && key.classList.contains('letter')) finalVal = val.toUpperCase();
            this.insertText(finalVal);
            this.lastInsertedBase = null;
        }
    },

    handleAction(action) {
        if (!this.activeInput && action !== 'hide') return;
        const text = this.activeInput ? this.activeInput.value : "";
        const start = this.activeInput ? this.activeInput.selectionStart : 0;

        switch(action) {
            case 'backspace':
                if (start > 0) {
                    this.activeInput.value = text.slice(0, start - 1) + text.slice(start);
                    this.activeInput.selectionStart = this.activeInput.selectionEnd = start - 1;
                    this.lastInsertedBase = null;
                    if(this.activeInput.id === 'search-input' && typeof handleSearch === 'function') handleSearch();
                }
                break;
            case 'space':
                this.insertText(' ');
                this.lastInsertedBase = null;
                break;
            case 'enter':
                if (this.activeInput.id === 'chat-msg-in' && typeof postMessage === 'function') {
                    postMessage();
                    this.hide(); 
                } else if (this.activeInput.id === 'search-input') {
                    this.hide();
                } else {
                    this.insertText('\n');
                }
                break;
            case 'toggleCaps':
                this.isCaps = !this.isCaps;
                document.querySelectorAll('.letter').forEach(key => {
                    const val = key.getAttribute('data-val');
                    key.innerHTML = `${this.isCaps ? val.toUpperCase() : val}<span class="key-popout">${this.isCaps ? val.toUpperCase() : val.toUpperCase()}</span>`;
                });
                break;
            case 'switchLang':
                this.switchPanel(document.getElementById('kb-am').classList.contains('active') ? 'kb-en' : 'kb-am');
                break;
            case 'switchNum':
                this.switchPanel('kb-num');
                break;
            case 'switchEmo':
                this.switchPanel('kb-emo');
                break;
            case 'switchSym': // FIXED: Added missing case to prevent errors
                this.switchPanel('kb-en'); // For now, returns to English. You can create a 'kb-sym' panel later.
                break;
            case 'hide':
                this.hide();
                break;
        }
        if(this.activeInput) this.activeInput.focus();
    },

    switchPanel(panelId) {
        document.querySelectorAll('.ea-kb-body').forEach(b => b.classList.remove('active'));
        document.getElementById(panelId).classList.add('active');
        document.getElementById('ea-kb-variants-bar').innerHTML = '<div class="variant-placeholder">ፊደል ይምረጡ</div>';
        this.lastInsertedBase = null;
    },

    showAmharicVariants(baseChar) {
        const variants = this.amharicMap[baseChar];
        const bar = document.getElementById('ea-kb-variants-bar');
        bar.innerHTML = ''; 
        
        if(variants) {
            variants.split('').forEach((char) => {
                const btn = document.createElement('div');
                btn.className = 'variant-key';
                btn.innerText = char;
                btn.setAttribute('data-variant', char);
                bar.appendChild(btn);
            });
        }
    },

    enforceCustomKeyboard() {
        const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea, input:not([type])');
        
        inputs.forEach(input => {
            input.setAttribute('inputmode', 'none'); 
            
            const showKb = (e) => {
                e.preventDefault();
                this.activeInput = e.target;
                this.show();
            };

            input.addEventListener('focus', showKb);
            input.addEventListener('click', showKb);
        });
    },

    insertText(char) {
        if (!this.activeInput) return;
        const start = this.activeInput.selectionStart;
        const end = this.activeInput.selectionEnd;
        const text = this.activeInput.value;
        
        this.activeInput.value = text.slice(0, start) + char + text.slice(end);
        this.activeInput.selectionStart = this.activeInput.selectionEnd = start + char.length;
        this.activeInput.focus();
        
        if(this.activeInput.id === 'search-input' && typeof handleSearch === 'function') handleSearch();
    },

    vibrate() {
        if (navigator.vibrate) navigator.vibrate(15); 
    },

    show() { 
        const kb = document.getElementById('eaCustomKeyboard');
        kb.classList.add('active'); 
        
        setTimeout(() => {
            const kbHeight = kb.offsetHeight;
            document.body.style.paddingBottom = (kbHeight + 20) + 'px';
            if(this.activeInput) {
                this.activeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    },
    
    hide() { 
        document.getElementById('eaCustomKeyboard').classList.remove('active'); 
        
        document.body.style.paddingBottom = 'calc(90px + env(safe-area-inset-bottom))'; 
        
        if(this.activeInput) this.activeInput.blur();
        this.activeInput = null;
        this.lastInsertedBase = null;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    EAKeyboard.init();
});
