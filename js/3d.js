import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DirectionalLightHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

//モデルデータのインポート
import { MODEL_DATA } from "./model.js";

class MainVisual {
    constructor (){
        this.container = document.querySelector('.model-viewer__display');
        this.clock = new THREE.Clock();
        this.camera = null;
        this.frustumSize = 3;
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
        this.baseRotation = 0;  // 基準となる回転値
        this.autoRotation = 0;              // 自動回転の進行度
        this.modelData = MODEL_DATA;  // 追加
        this.currentModel = null;     // 追加
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
        this.setupModelList();
        this.setupModelListeners();
        
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
        this.camera = new THREE.OrthographicCamera(
            this.frustumSize * aspect / -2, //左
            this.frustumSize * aspect /2, //右
            this.frustumSize  / 2, //上
            this.frustumSize / -2, //下
            0.1,
            1000
        )
        this.camera.rotation.set(-0.25, 0, 0);
        this.camera.position.set(0, 11.5, 40);
        
        this.scene.add(this.camera);
    }

    /*リサイズ設定
    ===================*/
    setupResizehandle() {
        if (!this.container) return;

        // カメラのアスペクト比を更新
        const aspect = this.container.clientWidth / this.container.clientHeight
    
        this.camera.left = this.frustumSize * aspect / -2;
        this.camera.right = this.frustumSize * aspect / 2;
        this.camera.top = this.frustumSize / 2;
        this.camera.bottom = this.frustumSize / -2;

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

    /*モデルのロード
    ===================*/

    // ボタンの作成
    setupModelList(){
        //モデルリストの要素取得
        const modelList = document.querySelector('.model-viewer__list');

        Object.values(MODEL_DATA).forEach(model => {
            const viewerItem = document.createElement('li'); //li要素を作成
            viewerItem.className = 'model-viewer__item'; //クラス名をつける
            viewerItem.dataset.modelID = model.id; //データ属性を追加
            viewerItem.textContent = model.displayName;
            modelList.appendChild(viewerItem);
        })

    }

    // クリック時の処理
    setupModelListeners(){
        const items = document.querySelectorAll('.model-viewer__item');

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                const modelID = e.target.dataset.modelID;
                this.switchModel(modelID);
            })
        })
    }

    async switchModel(modelID) {

        const modelData = MODEL_DATA[modelID];

        //表示モデルの削除
        if(this.currentModel) {
            this.scene.remove(this.currentModel)
        }

        const loader = new GLTFLoader();
        try{
            const gltf = await loader.loadAsync(modelData.path);
            this.currentModel = gltf.scene;

            // モデルのサイズや位置
            this.currentModel.scale.set(1, 1, 1);
            this.currentModel.position.set(0,0,0);
            this.currentModel.rotation.set(0,0,0);

            this.scene.add(this.currentModel);

            this.updateModelInfo(modelData);
        } catch (error){
            console.error('モデルの読み込みエラー:', error);
        }
    };

    updateModelInfo(modelData){
        const descriptionElement = document.querySelector('.model-viewer__model-discription');

        //説明文の更新
        if(descriptionElement){
            descriptionElement.textContent = modelData.description;
        }

        //タイトルの更新
        document.documentElement.style.setProperty('--model-title',`"${modelData.title}"`);

    }

    /*モデルローディング
    ===================*/
    setupLoadModel(){
        this.switchModel('vendingMachine')
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

        if(this.currentModel) {
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
                this.currentModel.rotation.y += delta * this.currentRotationSpeed;
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    /*マウスホバー時の挙動
    ===================*/
    updateModelRotation(e) {
        if(!this.currentModel) return;
    
        //ホバー時のモデルの滑らかさ
        const smoothness = .2;

        const rect = this.canvas.getBoundingClientRect(); //canvas要素の幅と位置を取得
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1; //canvas要素の位置と幅からマウスポインターが要素のどこに位置するかを計算
        
        //現在の回転を0-2πの範囲に正規化
        const normalizedCurrentRotation = this.currentModel.rotation.y % (Math.PI * 2);
        
        const rotationLimit = Math.PI / 4; //回転可能な範囲
        const targetRotation = x * rotationLimit; //マウスポインターが右端なら 90 + (1 * 90) = 180
        
        // 🔄 正規化された値で差分を計算
        const diff = ((targetRotation - normalizedCurrentRotation) + Math.PI) % (Math.PI * 2) - Math.PI;
        
        // 現在の実際の回転値に適用
        this.currentModel.rotation.y += diff * smoothness;
    }
    

}

const mainvisual = new MainVisual();