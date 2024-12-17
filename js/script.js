window.addEventListener('DOMContentLoaded', () => {
    // new MouseInteraction();
    new ScrollInteraction();
});

class ScrollInteraction {
    constructor() {
        // 要素の取得
        this.container = document.querySelector('.mainvisual');
        this.image = document.querySelector('.mainvisual__image');

        // 設定値
        this.config = {
            strength: 0.2,    // スクロールの影響力
            maxMove: 180,      // 最大移動量
            ease: 0.1         // 動きの滑らかさ
        };

        // スクロール関連の値
        this.scrollY = 0;     // 現在のスクロール位置
        this.targetY = 0;     // 目標位置

        this.init();
    }

    init() {
        // スクロールイベントの監視
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });

        // アニメーションの開始
        this.animate();
    }

    handleScroll() {
        // 現在のスクロール位置を取得
        this.targetY = window.scrollY * this.config.strength;
    }

    animate() {
        // 現在位置を目標位置に近づける
        this.scrollY += (this.targetY - this.scrollY) * this.config.ease;

        // 移動量を制限
        const moveY = Math.min(Math.max(this.scrollY, -this.config.maxMove), this.config.maxMove);

        // 画像を動かす
        this.image.style.transform = `translateY(${moveY}px)`;

        requestAnimationFrame(() => this.animate());
    }
}

