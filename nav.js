/**
 * ============================================================================
 * EA PREMIUM NAVIGATION & SPA ENGINE V3.0
 * Features: Instant SPA-like Routing, Ultra-Premium UI, Zero-Animation, 
 * Sabbath Mode Sync, Speculation Rules API for instant load.
 * ============================================================================
 */

const AppNavigation = {
    config: {
        sabbathCheck: true  
    },

    // የ Tour (Help) መረጃዎች
    tourSteps: [
        { id: 'home', title: "ዋና ገጽ", text: "ወደ ዋናው ገጽ ለመመለስ እና አጠቃላይ መረጃዎችን ለማግኘት ይህንን ይጠቀሙ።" },
        { id: 'mezmur', title: "መዝሙር (Audio)", text: "መዝሙሮችን ለማዳመጥ ይህንን ክፍል ይጠቀሙ።" },
        { id: 'hymnal', title: "የውዳሴ መዝሙር", text: "የውዳሴ መዝሙሮችን ለማንበብ ይህንን ክፍል ይጠቀሙ።" },
        { id: 'live', title: "ቀጥታ ስርጭት", text: "የቀጥታ ስርጭት ፕሮግራሞችን እዚህ መከታተል ይችላሉ።" },
        { id: 'sabbath', title: "የሰንበት ትምህርት", text: "የሰንበት ትምህርት ጥናትዎን በቀላሉ ለማጥናት ይጠቅማል።" },
        { id: 'choir', title: "ኳየር", text: "ለኳየር አባላት እና መሪዎች የተዘጋጀ ልዩ የመገናኛ ገጽ።" },
        { id: 'thanks', title: "ምስጋና", text: "በአገልግሎቱ ለተሳተፉ ቅዱሳን የተዘጋጀ የእውቅና ገጽ።" }
    ],
    currentTourStep: 0,

    init() {
        this.preventRubberBanding(); // አፑ ወደላይ ወደታች እንዳይጓተት (Native feel)
        this.injectStyles();         // የ Premium ዲዛይን ማስገቢያ (No Animation)
        this.injectNav();            // የ Navigation ባሩን ማስገቢያ
        this.syncTheme();            // የ Dark/Light Mode ማስተካከያ
        this.checkSabbath();         // የሰንበት ሞድ ማስተካከያ
        this.markActive();           // ያለንበትን ገጽ ማሳያ
        this.enableInstantSPA();     // ገጾች በቅጽበት እንዲከፈቱ የሚያደርገው ሞተር

        // አዲስ ተጠቃሚ ከሆነ ቱሩን (Tour) ይጀምራል
        if (!localStorage.getItem('ea_nav_tour_completed')) {
            setTimeout(() => this.startTour(), 300);
        }
    },

    preventRubberBanding() {
        // የሞባይል ብሮውዘሮች ሪፍሬሽ ሲያደርጉ የሚፈጠረውን መጓተት ያጠፋል
        document.body.style.overscrollBehaviorY = 'none';
        document.documentElement.style.overscrollBehaviorY = 'none';
    },

    enableInstantSPA() {
        // Chrome/Edge እና ሌሎች ዘመናዊ ብሮውዘሮች ገጹን ከጀርባ አስቀድመው እንዲያዘጋጁ (Prerender) ያደርጋል
        // ይህ ከገጽ ወደ ገጽ ሲሄዱ 0 ሰከንድ (በቅጽበት) እንዲከፈት ያደርገዋል
        const pages = ["home.html", "mezmur.html", "hyminal.html", "live.html", "sabbath.html", "kuayer.html", "thanks.html"];
        
        if (HTMLScriptElement.supports && HTMLScriptElement.supports('speculationrules')) {
            const specScript = document.createElement('script');
            specScript.type = 'speculationrules';
            specScript.textContent = JSON.stringify({
                prerender: [{
                    source: "list",
                    urls: pages
                }]
            });
            document.head.appendChild(specScript);
        } else {
            // ለቆዩ ብሮውዘሮች እንደ አማራጭ (Prefetch)
            pages.forEach(url => {
                const link = document.createElement('link');
                link.rel = 'prefetch';
                link.href = url;
                document.head.appendChild(link);
            });
        }
    },

    injectStyles() {
        // ምንም አይነት Animation የሌለው ግን እጅግ Premium የሆነ CSS
        const styleHTML = `
        <style>
            :root {
                --ea-nav-bg: rgba(255, 255, 255, 0.90);
                --ea-nav-border: rgba(0, 0, 0, 0.08);
                --ea-nav-text: #8e8e93;
                --ea-nav-active: #b8860b;
                --ea-nav-height: 75px;
                --ea-bg-body: #f4f6f8;
            }
            body.dark-mode {
                --ea-nav-bg: rgba(20, 20, 22, 0.90);
                --ea-nav-border: rgba(255, 255, 255, 0.05);
                --ea-nav-text: #636366;
                --ea-nav-active: #ffd700;
                --ea-bg-body: #050505;
            }
            body.sabbath-mode {
                --ea-nav-active: #00f3ff;
            }

            .ea-premium-nav {
                position: fixed;
                bottom: 0; left: 0; width: 100%;
                height: calc(var(--ea-nav-height) + env(safe-area-inset-bottom, 0px));
                background: var(--ea-nav-bg);
                backdrop-filter: blur(30px);
                -webkit-backdrop-filter: blur(30px);
                border-top: 1px solid var(--ea-nav-border);
                display: flex;
                justify-content: space-around;
                align-items: center;
                padding-bottom: env(safe-area-inset-bottom, 0px);
                z-index: 99999;
            }

            .ea-nav-item {
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                flex: 1; height: 100%; color: var(--ea-nav-text); text-decoration: none;
                /* ZERO ANIMATION CONSTRAINT */
                transition: none; 
            }

            .ea-nav-item i { font-size: 22px; margin-bottom: 4px; }
            .ea-nav-item span { font-size: 10px; font-weight: 800; font-family: 'Noto Sans Ethiopic', sans-serif; }
            
            .ea-nav-item.active { color: var(--ea-nav-active); }

            /* Home Button Premium - Center Floating */
            .ea-nav-home {
                position: relative;
                top: -18px;
                width: 60px; height: 60px;
                background: linear-gradient(135deg, #ffd700, #d4af37);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                color: #000 !important;
                box-shadow: 0 10px 25px rgba(255, 215, 0, 0.3);
                border: 5px solid var(--ea-bg-body);
                flex: none;
            }
            body.sabbath-mode .ea-nav-home {
                background: linear-gradient(135deg, #00f3ff, #008eb3);
                box-shadow: 0 10px 25px rgba(0, 243, 255, 0.3);
            }
            
            .ea-nav-home i { font-size: 24px; margin: 0; }
            .ea-nav-home span { display: none; }

            /* Tour System - Zero Animation */
            #ea-tour-overlay {
                position: fixed; inset: 0; background: rgba(0,0,0,0.85);
                z-index: 99998; display: none;
                backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
            }
            #ea-tour-tooltip {
                position: fixed; z-index: 100000; background: var(--surface, #ffffff);
                padding: 20px; border-radius: 18px; color: var(--text-main, #000);
                width: 290px; text-align: center; border: 2px solid var(--ea-nav-active);
                box-shadow: 0 20px 50px rgba(0,0,0,0.6); display: none;
                bottom: 110px; left: 50%; transform: translateX(-50%);
            }
            body.dark-mode #ea-tour-tooltip { background: #1a1a1a; color: #fff; }
            
            .tour-title { font-size: 18px; font-weight: 900; color: var(--ea-nav-active); margin-bottom: 8px; }
            .tour-text { font-size: 14px; font-weight: 600; line-height: 1.5; margin-bottom: 20px; color: var(--text-sub, #888); }
            .tour-buttons { display: flex; justify-content: space-between; gap: 12px; }
            .tour-btn { flex: 1; padding: 12px; border-radius: 12px; border: none; cursor: pointer; font-weight: 800; font-size: 14px; }
            .tour-btn-skip { background: transparent; color: var(--text-sub, #888); border: 1px solid var(--ea-nav-border); }
            .tour-btn-next { background: var(--ea-nav-active); color: #000; }
            
            .ea-tour-highlight {
                position: relative; z-index: 99999 !important;
                background: var(--surface, #fff) !important;
                border-radius: 12px;
                box-shadow: 0 0 0 5px var(--ea-nav-active), 0 10px 30px rgba(0,0,0,0.5) !important;
                pointer-events: none;
            }
        </style>`;
        
        if (!document.getElementById('ea-premium-nav-styles')) {
            document.head.insertAdjacentHTML('beforeend', `<div id="ea-premium-nav-styles">${styleHTML}</div>`);
        }
    },

    injectNav() {
        if (document.querySelector('.ea-premium-nav')) return;

        const navHTML = `
        <nav class="ea-premium-nav">
            <a href="mezmur.html" class="ea-nav-item" data-id="mezmur">
                <i class="fas fa-music"></i><span>መዝሙር</span>
            </a>     
            <a href="hyminal.html" class="ea-nav-item" data-id="hymnal">
                <i class="fas fa-book-open"></i><span>ውዳሴ</span>
            </a>            
            <a href="live.html" class="ea-nav-item" data-id="live">
                <i class="fas fa-broadcast-tower"></i><span>ቀጥታ</span>
            </a>
            
            <a href="home.html" class="ea-nav-item ea-nav-home" data-id="home">
                <i class="fas fa-home"></i><span>ዋና-ገፅ</span>
            </a>
            
            <a href="sabbath.html" class="ea-nav-item" data-id="sabbath">
                <i class="fas fa-bible"></i><span>ሰንበት ትምህርት</span>
            </a>
            <a href="choir.html" class="ea-nav-item" data-id="choir">
                <i class="fas fa-users"></i><span>ኳየር</span>
            </a>
            <a href="thanks.html" class="ea-nav-item" data-id="thanks">
                <i class="fas fa-medal"></i><span>ምስጋና</span>
            </a>
        </nav>
        
        <div id="ea-tour-overlay"></div>
        <div id="ea-tour-tooltip">
            <div class="tour-title" id="tour-title">ርዕስ</div>
            <div class="tour-text" id="tour-text">ማብራሪያ...</div>
            <div class="tour-buttons">
                <button class="tour-btn tour-btn-skip" onclick="AppNavigation.endTour()">ዝለል</button>
                <button class="tour-btn tour-btn-next" id="tour-next-btn" onclick="AppNavigation.nextTourStep()">ቀጣይ</button>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', navHTML);
        // መሸፈኛ ክፍተት ከስር ማዘጋጀት
        document.body.style.paddingBottom = "95px"; 

        // ክሊክ ሲደረግ በፍጥነት (Instant) active state ለመቀየር
        document.querySelectorAll('.ea-nav-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.ea-nav-item').forEach(n => n.classList.remove('active'));
                this.classList.add('active');
            });
        });
    },

    markActive() {
        const path = window.location.pathname.toLowerCase();
        const items = document.querySelectorAll('.ea-nav-item');
        
        // አሁን ያለንበትን የ html ስም መለየት
        let currentPage = 'home.html'; // Default
        const pathParts = path.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.includes('.html')) {
            currentPage = lastPart;
        }

        items.forEach(item => {
            const href = item.getAttribute('href').toLowerCase();
            if (href === currentPage) {
                item.classList.add('active');
            }
        });
    },

    syncTheme() {
        const theme = localStorage.getItem('ea_theme') || 'dark';
        if (theme === 'dark') document.body.classList.add('dark-mode');
    },

    checkSabbath() {
        const now = new Date();
        const day = now.getDay(); 
        const hour = now.getHours();
        const isSabbath = (day === 5 && hour >= 18) || (day === 6 && hour < 18);
        
        if (isSabbath && this.config.sabbathCheck) {
            document.body.classList.add('sabbath-mode');
        }
    },

    // ==========================================
    // ONBOARDING TOUR (HELP) SYSTEM
    // ==========================================
    startTour() {
        this.currentTourStep = 0;
        document.getElementById('ea-tour-overlay').style.display = 'block';
        document.getElementById('ea-tour-tooltip').style.display = 'block';
        this.showTourStep(this.currentTourStep);
    },

    showTourStep(index) {
        document.querySelectorAll('.ea-tour-highlight').forEach(el => el.classList.remove('ea-tour-highlight'));

        if (index >= this.tourSteps.length) {
            this.endTour();
            return;
        }

        const stepData = this.tourSteps[index];
        const targetElement = document.querySelector(`.ea-nav-item[data-id="${stepData.id}"]`);

        if (targetElement) {
            targetElement.classList.add('ea-tour-highlight');
            document.getElementById('tour-title').innerText = stepData.title;
            document.getElementById('tour-text').innerText = stepData.text;
            
            const nextBtn = document.getElementById('tour-next-btn');
            nextBtn.innerText = (index === this.tourSteps.length - 1) ? "ጨርስ" : "ቀጣይ";
        } else {
            this.nextTourStep();
        }
    },

    nextTourStep() {
        this.currentTourStep++;
        this.showTourStep(this.currentTourStep);
    },

    endTour() {
        document.querySelectorAll('.ea-tour-highlight').forEach(el => el.classList.remove('ea-tour-highlight'));
        document.getElementById('ea-tour-overlay').style.display = 'none';
        document.getElementById('ea-tour-tooltip').style.display = 'none';
        localStorage.setItem('ea_nav_tour_completed', 'true');
    }
};

window.addEventListener('DOMContentLoaded', () => AppNavigation.init());
