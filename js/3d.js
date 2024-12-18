import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DirectionalLightHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class MainVisual {
    constructor (){
        this.container = document.querySelector('.model-viewer__display');
        this.clock = new THREE.Clock();
        this.camera = null;
        this.scene = null;
        this.loader = null;
        this.renderer = null;
        this.mainLight = null;
        this.subLight01 = null;
        this.canvas = null;
        this.isHovering = false;
        this.init();
        this.isTransitioning = false;  // ✨ 遷移状態の管理
        this.targetRotation = null;    // ✨ 目標の回転値
        this.baseRotation = Math.PI * 1.5;  // 基準となる回転値
        this.autoRotation = 0;              // 自動回転の進行度
    }

    //初期化設定
    async init(){
        // シーンの作成
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupResizehandle();
        this.setupLights();
        this.setupLoadModel();
        this.setupAnimation();
        this.setupInteraction();
        
        // アスペクト比変更対応
        this.setupResizehandle = this.setupResizehandle.bind(this);
        window.addEventListener('resize', this.setupResizehandle) 

        // //カメラコントロールの追加
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    }

    /*シーン作成
    =============================*/
    setupScene(){
        this.scene = new THREE.Scene();
    }

    /*カメラセットアップ
    =============================*/
    setupCamera(){
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const frustumSize = 8;
        this.camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, //左
            frustumSize * aspect /2, //右
            frustumSize  / 2, //上
            frustumSize / -2, //下
            0.1,
            1000
        )
        this.camera.rotation.set(-0.25, 0, 0);
        this.camera.position.set(0, 13, 40);
        
        this.scene.add(this.camera);
    }

    /*レンダリングサイズ
    =============================*/
    setupRenderer(){
        //レンダラーの設定
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        });

        //レンダラーのサイズ設定
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight,
        );

        this.canvas = this.renderer.domElement
        this.container.appendChild(this.canvas);
    }

    /*リサイズ設定
    ===================*/
    setupResizehandle() {
        if (!this.container) return;

        // カメラのアスペクト比を更新
        const aspect = this.container.clientWidth / this.container.clientHeight;
        const frustumSize = 8;  // 初期化時と同じ値を使用
    
        this.camera.left = frustumSize * aspect / -2;
        this.camera.right = frustumSize * aspect / 2;
        this.camera.top = frustumSize / 2;
        this.camera.bottom = frustumSize / -2;

        this.camera.updateProjectionMatrix();

        // レンダラーのサイズを更新
        this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
        );
    }

    /*ライト設定
    ===================*/
    setupLights(){

        this.mainLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.mainLight);

        this.subLight01 = new THREE.DirectionalLight(0xffffff, 1);
        this.subLight01.position.set(5, 5, 5);
        this.scene.add(this.subLight01);

    }

    /*モデルローディング
    ===================*/
    setupLoadModel(){
        const loader = new GLTFLoader();
        loader.load(
            '../models/vendingMachine.glb',
            (gltf) => {
                //モデルのロード
                this.model = gltf.scene;
                this.scene.add(this.model);

                // モデルのサイズや位置
                this.model.scale.set(1, 1, 1);
                this.model.position.set(0,0,0);
                this.model.rotation.set(0,Math.PI * 1.5,0);
            }
        );
    }

    /*インインタラクション設定
    ===================*/
    setupInteraction() {
        this.canvas.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.currentRotationSpeed = 0;
        });
    
        this.canvas.addEventListener('mouseleave', () => {
            this.isHovering = false;
        });
    
        this.canvas.addEventListener('mousemove', (e) => {
            if(this.isHovering) {
                this.lastMouseEvent = e;
            }
        });
    }

    /*アニメーション
    ===================*/
    setupAnimation(){
        this.animate();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if(this.model) {
            // 通常の回転速度を計算
            const delta = this.clock.getDelta();
            const rotationSpeed = 1;
            
            if(this.isHovering) {
                if(this.lastMouseEvent) {
                    this.updateModelRotation(this.lastMouseEvent);
                }
            
            } else {
                if(!this.currentRotationSpeed) {
                    this.currentRotationSpeed = 0;
                }
            const speedSmoothness = .2;
            this.currentRotationSpeed += (rotationSpeed - this.currentRotationSpeed) * speedSmoothness;
                

                // 現在の速度で回転
                this.model.rotation.y += delta * this.currentRotationSpeed;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    /*マウスホバー時の挙動
    ===================*/
    updateModelRotation(e) {
        if(!this.model) return;
    
        //ホバー時のモデルの滑らかさ
        const smoothness = .2;

        const rect = this.canvas.getBoundingClientRect(); //canvas要素の幅と位置を取得
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; //canvas要素の位置と幅からマウスポインターが要素のどこに位置するかを計算
        
        //現在の回転を0-2πの範囲に正規化
        const normalizedCurrentRotation = this.model.rotation.y % (Math.PI * 2);
        
        const baseRotation = Math.PI * 1.5; //基準の角度
        const rotationLimit = Math.PI / 4; //回転可能な範囲
        const targetRotation = baseRotation + (x * rotationLimit); //マウスポインターが右端なら 90 + (1 * 90) = 180
        
        // 🔄 正規化された値で差分を計算
        const diff = ((targetRotation - normalizedCurrentRotation) + Math.PI) % (Math.PI * 2) - Math.PI;
        
        // 現在の実際の回転値に適用
        this.model.rotation.y += diff * smoothness;
    }
    

}

const mainvisual = new MainVisual();