/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! three */ "./node_modules/three/build/three.module.js");
/* harmony import */ var cannon_es__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! cannon-es */ "./node_modules/cannon-es/dist/cannon-es.js");
/* harmony import */ var _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @tweenjs/tween.js */ "./node_modules/@tweenjs/tween.js/dist/tween.esm.js");
/* harmony import */ var three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! three/examples/jsm/controls/OrbitControls */ "./node_modules/three/examples/jsm/controls/OrbitControls.js");
/* harmony import */ var three_examples_jsm_loaders_OBJLoader__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! three/examples/jsm/loaders/OBJLoader */ "./node_modules/three/examples/jsm/loaders/OBJLoader.js");
/* harmony import */ var three_examples_jsm_loaders_MTLLoader__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! three/examples/jsm/loaders/MTLLoader */ "./node_modules/three/examples/jsm/loaders/MTLLoader.js");
//22FI085 鍋島優太






class ThreeJSContainer {
    scene;
    light;
    rotationSpeed = 50; // 1秒で50度の回転
    maxRotation = three__WEBPACK_IMPORTED_MODULE_4__.MathUtils.degToRad(20); // 最大20度
    currentRotationX = 0;
    currentRotationY = 0;
    plate = null;
    plateBody = null;
    sphere = null;
    sphereBody = null;
    world;
    goalPosition;
    goalRadius;
    isCleared = false;
    goalMesh;
    particle;
    origin;
    constructor() {
        this.world = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.World({
            gravity: new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(0, -9.82, 0)
        });
        this.world.defaultContactMaterial.friction = 0.3;
        this.world.defaultContactMaterial.restitution = 0.01;
        this.goalPosition = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(9, -1, 9);
        this.goalRadius = 1.75; // ゴールの判定範囲
    }
    createRendererDOM = (width, height, cameraPos) => {
        const renderer = new three__WEBPACK_IMPORTED_MODULE_4__.WebGLRenderer();
        renderer.setSize(width, height);
        renderer.setClearColor(new three__WEBPACK_IMPORTED_MODULE_4__.Color(0x303030));
        renderer.shadowMap.enabled = true;
        const camera = new three__WEBPACK_IMPORTED_MODULE_4__.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.copy(cameraPos);
        camera.lookAt(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 0, 0));
        const orbitControls = new three_examples_jsm_controls_OrbitControls__WEBPACK_IMPORTED_MODULE_1__.OrbitControls(camera, renderer.domElement);
        this.createScene();
        const render = (time) => {
            orbitControls.update();
            renderer.render(this.scene, camera);
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        renderer.domElement.style.cssFloat = "left";
        renderer.domElement.style.margin = "10px";
        return renderer.domElement;
    };
    createScene = () => {
        this.scene = new three__WEBPACK_IMPORTED_MODULE_4__.Scene();
        //goal判定　opacityで透明度変えて確認
        const goalGeometry = new three__WEBPACK_IMPORTED_MODULE_4__.BoxGeometry(this.goalRadius, this.goalRadius, this.goalRadius);
        const goalMaterial = new three__WEBPACK_IMPORTED_MODULE_4__.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        this.goalMesh = new three__WEBPACK_IMPORTED_MODULE_4__.Mesh(goalGeometry, goalMaterial);
        this.goalMesh.position.copy(this.goalPosition);
        this.scene.add(this.goalMesh);
        //軸とグリット
        // const gridHelper = new THREE.GridHelper(100);
        // this.scene.add(gridHelper);
        // const axesHelper = new THREE.AxesHelper(10);
        // this.scene.add(axesHelper);
        //ライト
        this.light = new three__WEBPACK_IMPORTED_MODULE_4__.DirectionalLight(0xffffff);
        const lvec = new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(1, 1, 1).clone().normalize();
        this.light.position.set(lvec.x, lvec.y, lvec.z);
        this.scene.add(this.light);
        //objファイルとmtlファイルの読み込み（迷路）
        const mtlLoader = new three_examples_jsm_loaders_MTLLoader__WEBPACK_IMPORTED_MODULE_3__.MTLLoader();
        mtlLoader.load('meiro.mtl', (materials) => {
            materials.preload();
            for (const material of Object.values(materials.materials)) {
                material.side = three__WEBPACK_IMPORTED_MODULE_4__.DoubleSide;
            }
            const objLoader = new three_examples_jsm_loaders_OBJLoader__WEBPACK_IMPORTED_MODULE_2__.OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.load('meiro.obj', (object) => {
                this.plate = object;
                this.scene.add(object);
                object.position.set(0, 0, 0);
                // OBJから頂点情報を抽出
                const geometry = object.children[0].geometry;
                geometry.computeVertexNormals();
                const positionAttribute = geometry.getAttribute('position');
                const vertices = [];
                for (let i = 0; i < positionAttribute.count; i++) {
                    vertices.push(positionAttribute.getX(i), positionAttribute.getY(i), positionAttribute.getZ(i));
                }
                // インデックスの取得または生成
                let indices;
                if (geometry.index) {
                    indices = Array.from(geometry.index.array);
                }
                else {
                    indices = [];
                    for (let i = 0; i < positionAttribute.count; i++) {
                        indices.push(i);
                    }
                }
                // CANNON.esのTrimeshを作成
                const shape = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Trimesh(vertices, indices);
                // 物理演算のための設定
                this.plateBody = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Body({ mass: 0 });
                this.plateBody.addShape(shape);
                this.plateBody.position.copy(object.position);
                this.plateBody.interpolatedQuaternion;
                this.world.addBody(this.plateBody);
            }, (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            }, (error) => {
                console.log('An error happened');
            });
        });
        // スフィアの作成と追加
        const sphereGeometry = new three__WEBPACK_IMPORTED_MODULE_4__.SphereGeometry(0.5, 32, 32);
        const sphereMaterial = new three__WEBPACK_IMPORTED_MODULE_4__.MeshLambertMaterial({ color: 0xff0000 });
        this.sphere = new three__WEBPACK_IMPORTED_MODULE_4__.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.position.set(-9.5, 1, -9.5);
        this.scene.add(this.sphere);
        // 物理演算のためのスフィア設定
        const sphereShape = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Sphere(0.5);
        this.sphereBody = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Body({ mass: 1 });
        this.sphereBody.addShape(sphereShape);
        this.sphereBody.position.copy(this.sphere.position);
        this.world.addBody(this.sphereBody);
        //回転（角度付け） 迷路＋ゴール判定
        const rotateObject = (direction) => {
            if (!this.plateBody)
                return;
            const delta = three__WEBPACK_IMPORTED_MODULE_4__.MathUtils.degToRad(this.rotationSpeed / 60); // 60 FPS基準
            const rotationQuaternion = new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Quaternion();
            switch (direction) {
                case 'ArrowUp':
                    if (this.currentRotationX - delta >= -this.maxRotation) {
                        this.currentRotationX -= delta;
                        rotationQuaternion.setFromAxisAngle(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(1, 0, 0), -delta);
                        this.goalMesh.rotateOnWorldAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(1, 0, 0), -delta);
                        this.goalMesh.translateOnAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, -0.99, 0.01).clone().normalize(), -delta * 9);
                        // this.goalMesh.rotateX(delta);
                    }
                    break;
                case 'ArrowDown':
                    if (this.currentRotationX + delta <= this.maxRotation) {
                        this.currentRotationX += delta;
                        rotationQuaternion.setFromAxisAngle(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(1, 0, 0), delta);
                        this.goalMesh.rotateOnWorldAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(1, 0, 0), delta);
                        this.goalMesh.translateOnAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, -0.99, 0.01).clone().normalize(), delta * 9);
                    }
                    break;
                case 'ArrowRight':
                    if (this.currentRotationY - delta >= -this.maxRotation) {
                        this.currentRotationY -= delta;
                        rotationQuaternion.setFromAxisAngle(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(0, 0, 1), -delta);
                        this.goalMesh.rotateOnWorldAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 0, 1), -delta);
                        this.goalMesh.translateOnAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0.01, 0.99, 0).clone().normalize(), -delta * 9);
                    }
                    break;
                case 'ArrowLeft':
                    if (this.currentRotationY + delta <= this.maxRotation) {
                        this.currentRotationY += delta;
                        rotationQuaternion.setFromAxisAngle(new cannon_es__WEBPACK_IMPORTED_MODULE_5__.Vec3(0, 0, 1), delta);
                        this.goalMesh.rotateOnWorldAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 0, 1), delta);
                        this.goalMesh.translateOnAxis(new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0.01, 0.99, 0).clone().normalize(), delta * 9);
                    }
                    break;
            }
            this.plateBody.quaternion = this.plateBody.quaternion.mult(rotationQuaternion);
        };
        window.addEventListener('keydown', (event) => {
            rotateObject(event.key);
        });
        //クリアエフェクト
        const showClearEffect = () => {
            console.log("Clear!!!");
            let createParticles = () => {
                let generateSprite = () => {
                    //新しいキャンバスの作成
                    let canvas = document.createElement('canvas');
                    canvas.width = 16;
                    canvas.height = 16;
                    //円形のグラデーションの作成
                    let context = canvas.getContext('2d');
                    let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
                    gradient.addColorStop(0, 'rgba(255,255,255,1)');
                    gradient.addColorStop(0.2, 'rgba(0,0,255,1)');
                    gradient.addColorStop(0.4, 'rgba(0,0,64,1)');
                    gradient.addColorStop(1, 'rgba(0,0,0,1)');
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    //テクスチャの生成
                    let texture = new three__WEBPACK_IMPORTED_MODULE_4__.Texture(canvas);
                    texture.needsUpdate = true;
                    return texture;
                };
                let createPoints = (geom) => {
                    let material = new three__WEBPACK_IMPORTED_MODULE_4__.PointsMaterial({
                        color: 0xffffff,
                        size: 0.3,
                        transparent: true,
                        blending: three__WEBPACK_IMPORTED_MODULE_4__.AdditiveBlending,
                        depthWrite: false,
                        map: generateSprite()
                    });
                    return new three__WEBPACK_IMPORTED_MODULE_4__.Points(geom, material);
                };
                //THREE.Pointsの作成
                this.particle = createPoints(new three__WEBPACK_IMPORTED_MODULE_4__.SphereGeometry(10, 128, 128));
                this.origin = createPoints(new three__WEBPACK_IMPORTED_MODULE_4__.SphereGeometry(10, 128, 128));
                this.origin.translateY(100);
                this.scene.add(this.particle);
            };
            createParticles();
            let geometry = this.particle.geometry;
            let positions = geometry.getAttribute("position");
            let geometry2 = this.origin.geometry;
            geometry2.translate(0, 10, 0);
            let positions2 = geometry2.getAttribute("position");
            positions.needsUpdate = true;
            for (let i = 0; i < positions.count; ++i) {
                // Tweenでコントロールする変数の定義
                let tweeninfo = {
                    x: 0.0,
                    y: 0.0,
                    z: 0.0,
                    index: i
                };
                //  Tweenでパラメータの更新の際に呼び出される関数
                let translatePosition = () => {
                    positions.setX(tweeninfo.index, tweeninfo.x);
                    positions.setY(tweeninfo.index, tweeninfo.y);
                    positions.setZ(tweeninfo.index, tweeninfo.z);
                    positions.needsUpdate = true;
                };
                let getOriginPosition = () => {
                    let result = {
                        x: positions2.getX(i),
                        y: positions2.getY(i),
                        z: positions2.getZ(i)
                    };
                    return result;
                };
                // Tweenの作成
                const tween3 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo).to({ x: 0, y: 5, z: 0 }, 1000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Elastic.In).onUpdate(translatePosition);
                const tween2 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo).to({ x: 0, y: 0, z: 0 }, 1000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Elastic.In).onUpdate(translatePosition);
                const tween1 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo).to(getOriginPosition(), 2000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Elastic.Out).onUpdate(translatePosition);
                const tween0 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo).to({ x: 0, y: 0, z: 0 }, 1000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Exponential.InOut).onUpdate(translatePosition);
                // アニメーションの開始
                tween2.start();
                tween2.chain(tween3);
                tween3.chain(tween1);
                tween1.chain(tween0);
                tween0.chain(tween2);
            }
        };
        //クリア判定
        const checkGoal = () => {
            if (this.sphere && !this.isCleared) {
                const distance = this.sphere.position.distanceTo(this.goalMesh.position);
                if (distance <= this.goalRadius) {
                    this.isCleared = true;
                    showClearEffect();
                }
            }
        };
        let update = (time) => {
            this.world.fixedStep();
            if (this.plate && this.plateBody) {
                this.plate.position.copy(this.plateBody.position);
                this.plate.quaternion.copy(this.plateBody.quaternion);
            }
            if (this.sphere && this.sphereBody) {
                this.sphere.position.copy(this.sphereBody.position);
                this.sphere.quaternion.copy(this.sphereBody.quaternion);
            }
            checkGoal();
            _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.update();
            requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    };
}
window.addEventListener("DOMContentLoaded", init);
function init() {
    let container = new ThreeJSContainer();
    let viewport = container.createRendererDOM(640, 480, new three__WEBPACK_IMPORTED_MODULE_4__.Vector3(0, 20, 15));
    document.body.appendChild(viewport);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunkcgprendering"] = self["webpackChunkcgprendering"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_tweenjs_tween_js_dist_tween_esm_js-node_modules_cannon-es_dist_cannon-es-c48bc9"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7Ozs7O1VFaERBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvLi9zcmMvYXBwLnRzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2NodW5rIGxvYWRlZCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvanNvbnAgY2h1bmsgbG9hZGluZyIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly9jZ3ByZW5kZXJpbmcvd2VicGFjay9zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2FmdGVyLXN0YXJ0dXAiXSwic291cmNlc0NvbnRlbnQiOlsiLy8yMkZJMDg1IOmNi+WztuWEquWkqlxuXG5pbXBvcnQgKiBhcyBUSFJFRSBmcm9tIFwidGhyZWVcIjtcbmltcG9ydCAqIGFzIENBTk5PTiBmcm9tICdjYW5ub24tZXMnO1xuaW1wb3J0ICogYXMgVFdFRU4gZnJvbSBcIkB0d2VlbmpzL3R3ZWVuLmpzXCI7XG5pbXBvcnQgeyBPcmJpdENvbnRyb2xzIH0gZnJvbSBcInRocmVlL2V4YW1wbGVzL2pzbS9jb250cm9scy9PcmJpdENvbnRyb2xzXCI7XG5pbXBvcnQgeyBPQkpMb2FkZXIgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9PQkpMb2FkZXInO1xuaW1wb3J0IHsgTVRMTG9hZGVyIH0gZnJvbSAndGhyZWUvZXhhbXBsZXMvanNtL2xvYWRlcnMvTVRMTG9hZGVyJztcblxuY2xhc3MgVGhyZWVKU0NvbnRhaW5lciB7XG4gICAgcHJpdmF0ZSBzY2VuZTogVEhSRUUuU2NlbmU7XG4gICAgcHJpdmF0ZSBsaWdodDogVEhSRUUuTGlnaHQ7XG4gICAgcHJpdmF0ZSByb3RhdGlvblNwZWVkOiBudW1iZXIgPSA1MDsgLy8gMeenkuOBpzUw5bqm44Gu5Zue6LuiXG4gICAgcHJpdmF0ZSBtYXhSb3RhdGlvbjogbnVtYmVyID0gVEhSRUUuTWF0aFV0aWxzLmRlZ1RvUmFkKDIwKTsgLy8g5pyA5aSnMjDluqZcblxuICAgIHByaXZhdGUgY3VycmVudFJvdGF0aW9uWDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGN1cnJlbnRSb3RhdGlvblk6IG51bWJlciA9IDA7XG4gICAgcHJpdmF0ZSBwbGF0ZTogVEhSRUUuT2JqZWN0M0QgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHBsYXRlQm9keTogQ0FOTk9OLkJvZHkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHNwaGVyZTogVEhSRUUuTWVzaCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3BoZXJlQm9keTogQ0FOTk9OLkJvZHkgfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHdvcmxkOiBDQU5OT04uV29ybGQ7XG5cblxuICAgIHByaXZhdGUgZ29hbFBvc2l0aW9uOiBUSFJFRS5WZWN0b3IzO1xuICAgIHByaXZhdGUgZ29hbFJhZGl1czogbnVtYmVyO1xuICAgIHByaXZhdGUgaXNDbGVhcmVkOiBib29sZWFuID0gZmFsc2U7XG4gICAgcHJpdmF0ZSBnb2FsTWVzaDogVEhSRUUuTWVzaDtcblxuICAgIHByaXZhdGUgcGFydGljbGU6IFRIUkVFLlBvaW50cztcbiAgICBwcml2YXRlIG9yaWdpbjogVEhSRUUuUG9pbnRzO1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMud29ybGQgPSBuZXcgQ0FOTk9OLldvcmxkKHtcbiAgICAgICAgICAgIGdyYXZpdHk6IG5ldyBDQU5OT04uVmVjMygwLCAtOS44MiwgMClcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMud29ybGQuZGVmYXVsdENvbnRhY3RNYXRlcmlhbC5mcmljdGlvbiA9IDAuMztcbiAgICAgICAgdGhpcy53b3JsZC5kZWZhdWx0Q29udGFjdE1hdGVyaWFsLnJlc3RpdHV0aW9uID0gMC4wMTtcblxuICAgICAgICB0aGlzLmdvYWxQb3NpdGlvbiA9IG5ldyBUSFJFRS5WZWN0b3IzKDksIC0xLCA5KTtcbiAgICAgICAgdGhpcy5nb2FsUmFkaXVzID0gMS43NTsgIC8vIOOCtOODvOODq+OBruWIpOWumuevhOWbslxuICAgIH1cblxuICAgIHB1YmxpYyBjcmVhdGVSZW5kZXJlckRPTSA9ICh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgY2FtZXJhUG9zOiBUSFJFRS5WZWN0b3IzKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbmRlcmVyID0gbmV3IFRIUkVFLldlYkdMUmVuZGVyZXIoKTtcbiAgICAgICAgcmVuZGVyZXIuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgcmVuZGVyZXIuc2V0Q2xlYXJDb2xvcihuZXcgVEhSRUUuQ29sb3IoMHgzMDMwMzApKTtcbiAgICAgICAgcmVuZGVyZXIuc2hhZG93TWFwLmVuYWJsZWQgPSB0cnVlO1xuICAgICAgICBjb25zdCBjYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoNzUsIHdpZHRoIC8gaGVpZ2h0LCAwLjEsIDEwMDApO1xuICAgICAgICBjYW1lcmEucG9zaXRpb24uY29weShjYW1lcmFQb3MpO1xuICAgICAgICBjYW1lcmEubG9va0F0KG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApKTtcbiAgICAgICAgY29uc3Qgb3JiaXRDb250cm9scyA9IG5ldyBPcmJpdENvbnRyb2xzKGNhbWVyYSwgcmVuZGVyZXIuZG9tRWxlbWVudCk7XG4gICAgICAgIHRoaXMuY3JlYXRlU2NlbmUoKTtcblxuICAgICAgICBjb25zdCByZW5kZXI6IEZyYW1lUmVxdWVzdENhbGxiYWNrID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIG9yYml0Q29udHJvbHMudXBkYXRlKCk7XG4gICAgICAgICAgICByZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgY2FtZXJhKTtcbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpO1xuXG4gICAgICAgIHJlbmRlcmVyLmRvbUVsZW1lbnQuc3R5bGUuY3NzRmxvYXQgPSBcImxlZnRcIjtcbiAgICAgICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5tYXJnaW4gPSBcIjEwcHhcIjtcbiAgICAgICAgcmV0dXJuIHJlbmRlcmVyLmRvbUVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjcmVhdGVTY2VuZSA9ICgpID0+IHtcbiAgICAgICAgdGhpcy5zY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuXG4gICAgICAgIC8vZ29hbOWIpOWumuOAgG9wYWNpdHnjgafpgI/mmI7luqblpInjgYjjgabnorroqo1cbiAgICAgICAgY29uc3QgZ29hbEdlb21ldHJ5ID0gbmV3IFRIUkVFLkJveEdlb21ldHJ5KHRoaXMuZ29hbFJhZGl1cyx0aGlzLmdvYWxSYWRpdXMsdGhpcy5nb2FsUmFkaXVzKTtcbiAgICAgICAgY29uc3QgZ29hbE1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hCYXNpY01hdGVyaWFsKHsgY29sb3I6IDB4MDBmZjAwLCB0cmFuc3BhcmVudDogdHJ1ZSwgb3BhY2l0eTogMCB9KTtcbiAgICAgICAgdGhpcy5nb2FsTWVzaCA9IG5ldyBUSFJFRS5NZXNoKGdvYWxHZW9tZXRyeSwgZ29hbE1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5nb2FsTWVzaC5wb3NpdGlvbi5jb3B5KHRoaXMuZ29hbFBvc2l0aW9uKTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5nb2FsTWVzaCk7XG5cbiAgICAgICAgLy/ou7jjgajjgrDjg6rjg4Pjg4hcbiAgICAgICAgLy8gY29uc3QgZ3JpZEhlbHBlciA9IG5ldyBUSFJFRS5HcmlkSGVscGVyKDEwMCk7XG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKGdyaWRIZWxwZXIpO1xuICAgICAgICAvLyBjb25zdCBheGVzSGVscGVyID0gbmV3IFRIUkVFLkF4ZXNIZWxwZXIoMTApO1xuICAgICAgICAvLyB0aGlzLnNjZW5lLmFkZChheGVzSGVscGVyKTtcblxuICAgICAgICAvL+ODqeOCpOODiFxuICAgICAgICB0aGlzLmxpZ2h0ID0gbmV3IFRIUkVFLkRpcmVjdGlvbmFsTGlnaHQoMHhmZmZmZmYpO1xuICAgICAgICBjb25zdCBsdmVjID0gbmV3IFRIUkVFLlZlY3RvcjMoMSwgMSwgMSkubm9ybWFsaXplKCk7XG4gICAgICAgIHRoaXMubGlnaHQucG9zaXRpb24uc2V0KGx2ZWMueCwgbHZlYy55LCBsdmVjLnopO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmxpZ2h0KTtcblxuICAgICAgICAvL29iauODleOCoeOCpOODq+OBqG10bOODleOCoeOCpOODq+OBruiqreOBv+i+vOOBv++8iOi/t+i3r++8iVxuICAgICAgICBjb25zdCBtdGxMb2FkZXIgPSBuZXcgTVRMTG9hZGVyKCk7XG4gICAgICAgIG10bExvYWRlci5sb2FkKCdtZWlyby5tdGwnLCAobWF0ZXJpYWxzKSA9PiB7XG4gICAgICAgICAgICBtYXRlcmlhbHMucHJlbG9hZCgpO1xuXG4gICAgICAgICAgICBmb3IgKGNvbnN0IG1hdGVyaWFsIG9mIE9iamVjdC52YWx1ZXMobWF0ZXJpYWxzLm1hdGVyaWFscykpIHtcbiAgICAgICAgICAgICAgICBtYXRlcmlhbC5zaWRlID0gVEhSRUUuRG91YmxlU2lkZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3Qgb2JqTG9hZGVyID0gbmV3IE9CSkxvYWRlcigpO1xuICAgICAgICAgICAgb2JqTG9hZGVyLnNldE1hdGVyaWFscyhtYXRlcmlhbHMpO1xuICAgICAgICAgICAgb2JqTG9hZGVyLmxvYWQoJ21laXJvLm9iaicsIChvYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXRlID0gb2JqZWN0O1xuICAgICAgICAgICAgICAgIHRoaXMuc2NlbmUuYWRkKG9iamVjdCk7XG4gICAgICAgICAgICAgICAgb2JqZWN0LnBvc2l0aW9uLnNldCgwLCAwLCAwKTtcblxuICAgICAgICAgICAgICAgIC8vIE9CSuOBi+OCiemggueCueaDheWgseOCkuaKveWHulxuICAgICAgICAgICAgICAgIGNvbnN0IGdlb21ldHJ5ID0gKG9iamVjdC5jaGlsZHJlblswXSBhcyBUSFJFRS5NZXNoKS5nZW9tZXRyeTtcbiAgICAgICAgICAgICAgICBnZW9tZXRyeS5jb21wdXRlVmVydGV4Tm9ybWFscygpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQXR0cmlidXRlID0gZ2VvbWV0cnkuZ2V0QXR0cmlidXRlKCdwb3NpdGlvbicpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHZlcnRpY2VzID0gW107XG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbkF0dHJpYnV0ZS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkF0dHJpYnV0ZS5nZXRYKGkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25BdHRyaWJ1dGUuZ2V0WShpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uQXR0cmlidXRlLmdldFooaSlcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDjgqTjg7Pjg4fjg4Pjgq/jgrnjga7lj5blvpfjgb7jgZ/jga/nlJ/miJBcbiAgICAgICAgICAgICAgICBsZXQgaW5kaWNlczogbnVtYmVyW107XG4gICAgICAgICAgICAgICAgaWYgKGdlb21ldHJ5LmluZGV4KSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMgPSBBcnJheS5mcm9tKGdlb21ldHJ5LmluZGV4LmFycmF5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzID0gW107XG4gICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25BdHRyaWJ1dGUuY291bnQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gQ0FOTk9OLmVz44GuVHJpbWVzaOOCkuS9nOaIkFxuICAgICAgICAgICAgICAgIGNvbnN0IHNoYXBlID0gbmV3IENBTk5PTi5UcmltZXNoKHZlcnRpY2VzLCBpbmRpY2VzKTtcblxuICAgICAgICAgICAgICAgIC8vIOeJqeeQhua8lOeul+OBruOBn+OCgeOBruioreWumlxuICAgICAgICAgICAgICAgIHRoaXMucGxhdGVCb2R5ID0gbmV3IENBTk5PTi5Cb2R5KHsgbWFzczogMCB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXRlQm9keS5hZGRTaGFwZShzaGFwZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF0ZUJvZHkucG9zaXRpb24uY29weShvYmplY3QucG9zaXRpb24gYXMgdW5rbm93biBhcyBDQU5OT04uVmVjMyk7XG4gICAgICAgICAgICAgICAgdGhpcy5wbGF0ZUJvZHkuaW50ZXJwb2xhdGVkUXVhdGVybmlvblxuICAgICAgICAgICAgICAgIHRoaXMud29ybGQuYWRkQm9keSh0aGlzLnBsYXRlQm9keSk7XG4gICAgICAgICAgICB9LCAoeGhyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coKHhoci5sb2FkZWQgLyB4aHIudG90YWwgKiAxMDApICsgJyUgbG9hZGVkJyk7XG4gICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQW4gZXJyb3IgaGFwcGVuZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyDjgrnjg5XjgqPjgqLjga7kvZzmiJDjgajov73liqBcbiAgICAgICAgY29uc3Qgc3BoZXJlR2VvbWV0cnkgPSBuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoMC41LCAzMiwgMzIpO1xuICAgICAgICBjb25zdCBzcGhlcmVNYXRlcmlhbCA9IG5ldyBUSFJFRS5NZXNoTGFtYmVydE1hdGVyaWFsKHsgY29sb3I6IDB4ZmYwMDAwIH0pO1xuICAgICAgICB0aGlzLnNwaGVyZSA9IG5ldyBUSFJFRS5NZXNoKHNwaGVyZUdlb21ldHJ5LCBzcGhlcmVNYXRlcmlhbCk7XG4gICAgICAgIHRoaXMuc3BoZXJlLnBvc2l0aW9uLnNldCgtOS41LCAxLCAtOS41KTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGhlcmUpO1xuXG4gICAgICAgIC8vIOeJqeeQhua8lOeul+OBruOBn+OCgeOBruOCueODleOCo+OCouioreWumlxuICAgICAgICBjb25zdCBzcGhlcmVTaGFwZSA9IG5ldyBDQU5OT04uU3BoZXJlKDAuNSk7XG4gICAgICAgIHRoaXMuc3BoZXJlQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDEgfSk7XG4gICAgICAgIHRoaXMuc3BoZXJlQm9keS5hZGRTaGFwZShzcGhlcmVTaGFwZSk7XG4gICAgICAgIHRoaXMuc3BoZXJlQm9keS5wb3NpdGlvbi5jb3B5KHRoaXMuc3BoZXJlLnBvc2l0aW9uIGFzIHVua25vd24gYXMgQ0FOTk9OLlZlYzMpO1xuICAgICAgICB0aGlzLndvcmxkLmFkZEJvZHkodGhpcy5zcGhlcmVCb2R5KTtcblxuICAgICAgICAvL+Wbnui7ou+8iOinkuW6puS7mOOBke+8iSDov7fot6/vvIvjgrTjg7zjg6vliKTlrppcbiAgICAgICAgY29uc3Qgcm90YXRlT2JqZWN0ID0gKGRpcmVjdGlvbjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucGxhdGVCb2R5KSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gVEhSRUUuTWF0aFV0aWxzLmRlZ1RvUmFkKHRoaXMucm90YXRpb25TcGVlZCAvIDYwKTsgLy8gNjAgRlBT5Z+65rqWXG4gICAgICAgICAgICBjb25zdCByb3RhdGlvblF1YXRlcm5pb24gPSBuZXcgQ0FOTk9OLlF1YXRlcm5pb24oKTtcblxuXG4gICAgICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb25YIC0gZGVsdGEgPj0gLXRoaXMubWF4Um90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uWCAtPSBkZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uUXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKG5ldyBDQU5OT04uVmVjMygxLCAwLCAwKSwgLWRlbHRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMSwwLDApLCAtZGVsdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gudHJhbnNsYXRlT25BeGlzKG5ldyBUSFJFRS5WZWN0b3IzKDAsLTAuOTksMC4wMSkubm9ybWFsaXplKCksIC1kZWx0YSo5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuZ29hbE1lc2gucm90YXRlWChkZWx0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uWCArIGRlbHRhIDw9IHRoaXMubWF4Um90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uWCArPSBkZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uUXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKG5ldyBDQU5OT04uVmVjMygxLCAwLCAwKSwgZGVsdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5yb3RhdGVPbldvcmxkQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygxLDAsMCksIGRlbHRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnRyYW5zbGF0ZU9uQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygwLC0wLjk5LDAuMDEpLm5vcm1hbGl6ZSgpLCBkZWx0YSo5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uWSAtIGRlbHRhID49IC10aGlzLm1heFJvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvblkgLT0gZGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvblF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZShuZXcgQ0FOTk9OLlZlYzMoMCwgMCwgMSksIC1kZWx0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnJvdGF0ZU9uV29ybGRBeGlzKG5ldyBUSFJFRS5WZWN0b3IzKDAsMCwxKSwgLWRlbHRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnRyYW5zbGF0ZU9uQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygwLjAxLDAuOTksMCkubm9ybWFsaXplKCksIC1kZWx0YSo5KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvblkgKyBkZWx0YSA8PSB0aGlzLm1heFJvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvblkgKz0gZGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvblF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZShuZXcgQ0FOTk9OLlZlYzMoMCwgMCwgMSksIGRlbHRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMCwwLDEpLCBkZWx0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC50cmFuc2xhdGVPbkF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMC4wMSwwLjk5LDApLm5vcm1hbGl6ZSgpLCBkZWx0YSo5KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBsYXRlQm9keS5xdWF0ZXJuaW9uID0gdGhpcy5wbGF0ZUJvZHkucXVhdGVybmlvbi5tdWx0KHJvdGF0aW9uUXVhdGVybmlvbik7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgcm90YXRlT2JqZWN0KGV2ZW50LmtleSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy/jgq/jg6rjgqLjgqjjg5Xjgqfjgq/jg4hcbiAgICAgICAgY29uc3Qgc2hvd0NsZWFyRWZmZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDbGVhciEhIVwiKTtcbiAgICAgICAgICAgIGxldCBjcmVhdGVQYXJ0aWNsZXMgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGdlbmVyYXRlU3ByaXRlID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvL+aWsOOBl+OBhOOCreODo+ODs+ODkOOCueOBruS9nOaIkFxuICAgICAgICAgICAgICAgICAgICBsZXQgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IDE2O1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gMTY7XG5cbiAgICAgICAgICAgICAgICAgICAgLy/lhoblvaLjga7jgrDjg6njg4fjg7zjgrfjg6fjg7Pjga7kvZzmiJBcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudChjYW52YXMud2lkdGggLyAyLCBjYW52YXMuaGVpZ2h0IC8gMiwgMCwgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDIsIGNhbnZhcy53aWR0aCAvIDIpO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoMjU1LDI1NSwyNTUsMSknKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuMiwgJ3JnYmEoMCwwLDI1NSwxKScpO1xuICAgICAgICAgICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMC40LCAncmdiYSgwLDAsNjQsMSknKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKDAsMCwwLDEpJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBncmFkaWVudDtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAvL+ODhuOCr+OCueODgeODo+OBrueUn+aIkFxuXG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVQb2ludHMgPSAoZ2VvbTogVEhSRUUuQnVmZmVyR2VvbWV0cnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAweGZmZmZmZixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IDAuMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogZ2VuZXJhdGVTcHJpdGUoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5Qb2ludHMoZ2VvbSwgbWF0ZXJpYWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vVEhSRUUuUG9pbnRz44Gu5L2c5oiQXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJ0aWNsZSA9IGNyZWF0ZVBvaW50cyhuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIDEwLCAxMjgsIDEyOCApKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbiA9IGNyZWF0ZVBvaW50cyhuZXcgVEhSRUUuU3BoZXJlR2VvbWV0cnkoIDEwLCAxMjgsIDEyOCApKTtcbiAgICAgICAgICAgICAgICB0aGlzLm9yaWdpbi50cmFuc2xhdGVZKDEwMCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5wYXJ0aWNsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNyZWF0ZVBhcnRpY2xlcygpO1xuXG5cbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IDxUSFJFRS5CdWZmZXJHZW9tZXRyeT50aGlzLnBhcnRpY2xlLmdlb21ldHJ5O1xuICAgICAgICAgICAgbGV0IHBvc2l0aW9ucyA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIpO1xuICAgICAgICAgICAgbGV0IGdlb21ldHJ5MiA9IDxUSFJFRS5CdWZmZXJHZW9tZXRyeT50aGlzLm9yaWdpbi5nZW9tZXRyeTtcbiAgICAgICAgICAgIGdlb21ldHJ5Mi50cmFuc2xhdGUoMCwxMCwwKTtcbiAgICAgICAgICAgIGxldCBwb3NpdGlvbnMyID0gZ2VvbWV0cnkyLmdldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIpO1xuICAgICAgICAgICAgcG9zaXRpb25zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgZm9yKGxldCBpID0gMDtpPHBvc2l0aW9ucy5jb3VudDsgKytpKXtcbiAgICAgICAgICAgICAgICAvLyBUd2VlbuOBp+OCs+ODs+ODiOODreODvOODq+OBmeOCi+WkieaVsOOBruWumue+qVxuICAgICAgICAgICAgICAgIGxldCB0d2VlbmluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IDAuMCxcbiAgICAgICAgICAgICAgICAgICAgeTogMC4wLFxuICAgICAgICAgICAgICAgICAgICB6OiAwLjAsXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vICBUd2VlbuOBp+ODkeODqeODoeODvOOCv+OBruabtOaWsOOBrumam+OBq+WRvOOBs+WHuuOBleOCjOOCi+mWouaVsFxuICAgICAgICAgICAgICAgIGxldCB0cmFuc2xhdGVQb3NpdGlvbiA9KCk9PntcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLnNldFgodHdlZW5pbmZvLmluZGV4LCB0d2VlbmluZm8ueCk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5zZXRZKHR3ZWVuaW5mby5pbmRleCwgdHdlZW5pbmZvLnkpO1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0Wih0d2VlbmluZm8uaW5kZXgsIHR3ZWVuaW5mby56KTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZ2V0T3JpZ2luUG9zaXRpb24gPSAoKSA9PntcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBvc2l0aW9uczIuZ2V0WChpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBvc2l0aW9uczIuZ2V0WShpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHo6IHBvc2l0aW9uczIuZ2V0WihpKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gVHdlZW7jga7kvZzmiJBcbiAgICAgICAgICAgICAgICBjb25zdCB0d2VlbjMgPSBuZXcgVFdFRU4uVHdlZW4odHdlZW5pbmZvKS50byh7eDogMCwgeTogNSwgejogMCB9ICwxMDAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW4pLm9uVXBkYXRlKHRyYW5zbGF0ZVBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIGNvbnN0IHR3ZWVuMiA9IG5ldyBUV0VFTi5Ud2Vlbih0d2VlbmluZm8pLnRvKHsgeDogMCwgeTogMCwgejogMCB9LCAxMDAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkVsYXN0aWMuSW4pLm9uVXBkYXRlKHRyYW5zbGF0ZVBvc2l0aW9uKTtcbiAgICAgICAgICAgICAgICBjb25zdCB0d2VlbjEgPSBuZXcgVFdFRU4uVHdlZW4odHdlZW5pbmZvKS50byhnZXRPcmlnaW5Qb3NpdGlvbigpLCAyMDAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lYXNpbmcoVFdFRU4uRWFzaW5nLkVsYXN0aWMuT3V0KS5vblVwZGF0ZSh0cmFuc2xhdGVQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgY29uc3QgdHdlZW4wID0gbmV3IFRXRUVOLlR3ZWVuKHR3ZWVuaW5mbykudG8oeyB4OiAwLCB5OiAwLCB6OiAwIH0sIDEwMDApXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuRXhwb25lbnRpYWwuSW5PdXQpLm9uVXBkYXRlKHRyYW5zbGF0ZVBvc2l0aW9uKTtcblxuICAgICAgICAgICAgICAgIC8vIOOCouODi+ODoeODvOOCt+ODp+ODs+OBrumWi+Wni1xuICAgICAgICAgICAgICAgIHR3ZWVuMi5zdGFydCgpO1xuICAgICAgICAgICAgICAgIHR3ZWVuMi5jaGFpbih0d2VlbjMpO1xuICAgICAgICAgICAgICAgIHR3ZWVuMy5jaGFpbih0d2VlbjEpO1xuICAgICAgICAgICAgICAgIHR3ZWVuMS5jaGFpbih0d2VlbjApO1xuICAgICAgICAgICAgICAgIHR3ZWVuMC5jaGFpbih0d2VlbjIpXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Kv44Oq44Ki5Yik5a6aXG4gICAgICAgIGNvbnN0IGNoZWNrR29hbCA9ICgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNwaGVyZSAmJiAhdGhpcy5pc0NsZWFyZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHRoaXMuc3BoZXJlLnBvc2l0aW9uLmRpc3RhbmNlVG8odGhpcy5nb2FsTWVzaC5wb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDw9IHRoaXMuZ29hbFJhZGl1cykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzQ2xlYXJlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNob3dDbGVhckVmZmVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cblxuXG4gICAgICAgIGxldCB1cGRhdGU6IEZyYW1lUmVxdWVzdENhbGxiYWNrID0gKHRpbWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMud29ybGQuZml4ZWRTdGVwKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5wbGF0ZSAmJiB0aGlzLnBsYXRlQm9keSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhdGUucG9zaXRpb24uY29weSh0aGlzLnBsYXRlQm9keS5wb3NpdGlvbiBhcyB1bmtub3duIGFzIFRIUkVFLlZlY3RvcjMpO1xuICAgICAgICAgICAgICAgIHRoaXMucGxhdGUucXVhdGVybmlvbi5jb3B5KHRoaXMucGxhdGVCb2R5LnF1YXRlcm5pb24gYXMgdW5rbm93biBhcyBUSFJFRS5RdWF0ZXJuaW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnNwaGVyZSAmJiB0aGlzLnNwaGVyZUJvZHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZS5wb3NpdGlvbi5jb3B5KHRoaXMuc3BoZXJlQm9keS5wb3NpdGlvbiBhcyB1bmtub3duIGFzIFRIUkVFLlZlY3RvcjMpO1xuICAgICAgICAgICAgICAgIHRoaXMuc3BoZXJlLnF1YXRlcm5pb24uY29weSh0aGlzLnNwaGVyZUJvZHkucXVhdGVybmlvbiBhcyB1bmtub3duIGFzIFRIUkVFLlF1YXRlcm5pb24pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjaGVja0dvYWwoKVxuICAgICAgICAgICAgVFdFRU4udXBkYXRlKCk7XG5cbiAgICAgICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh1cGRhdGUpO1xuICAgIH1cbn1cblxuXG53aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgbGV0IGNvbnRhaW5lciA9IG5ldyBUaHJlZUpTQ29udGFpbmVyKCk7XG5cbiAgICBsZXQgdmlld3BvcnQgPSBjb250YWluZXIuY3JlYXRlUmVuZGVyZXJET00oNjQwLCA0ODAsIG5ldyBUSFJFRS5WZWN0b3IzKDAsIDIwLCAxNSkpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodmlld3BvcnQpO1xufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbi8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBfX3dlYnBhY2tfbW9kdWxlc19fO1xuXG4iLCJ2YXIgZGVmZXJyZWQgPSBbXTtcbl9fd2VicGFja19yZXF1aXJlX18uTyA9IChyZXN1bHQsIGNodW5rSWRzLCBmbiwgcHJpb3JpdHkpID0+IHtcblx0aWYoY2h1bmtJZHMpIHtcblx0XHRwcmlvcml0eSA9IHByaW9yaXR5IHx8IDA7XG5cdFx0Zm9yKHZhciBpID0gZGVmZXJyZWQubGVuZ3RoOyBpID4gMCAmJiBkZWZlcnJlZFtpIC0gMV1bMl0gPiBwcmlvcml0eTsgaS0tKSBkZWZlcnJlZFtpXSA9IGRlZmVycmVkW2kgLSAxXTtcblx0XHRkZWZlcnJlZFtpXSA9IFtjaHVua0lkcywgZm4sIHByaW9yaXR5XTtcblx0XHRyZXR1cm47XG5cdH1cblx0dmFyIG5vdEZ1bGZpbGxlZCA9IEluZmluaXR5O1xuXHRmb3IgKHZhciBpID0gMDsgaSA8IGRlZmVycmVkLmxlbmd0aDsgaSsrKSB7XG5cdFx0dmFyIFtjaHVua0lkcywgZm4sIHByaW9yaXR5XSA9IGRlZmVycmVkW2ldO1xuXHRcdHZhciBmdWxmaWxsZWQgPSB0cnVlO1xuXHRcdGZvciAodmFyIGogPSAwOyBqIDwgY2h1bmtJZHMubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmICgocHJpb3JpdHkgJiAxID09PSAwIHx8IG5vdEZ1bGZpbGxlZCA+PSBwcmlvcml0eSkgJiYgT2JqZWN0LmtleXMoX193ZWJwYWNrX3JlcXVpcmVfXy5PKS5ldmVyeSgoa2V5KSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXy5PW2tleV0oY2h1bmtJZHNbal0pKSkpIHtcblx0XHRcdFx0Y2h1bmtJZHMuc3BsaWNlKGotLSwgMSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmdWxmaWxsZWQgPSBmYWxzZTtcblx0XHRcdFx0aWYocHJpb3JpdHkgPCBub3RGdWxmaWxsZWQpIG5vdEZ1bGZpbGxlZCA9IHByaW9yaXR5O1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZihmdWxmaWxsZWQpIHtcblx0XHRcdGRlZmVycmVkLnNwbGljZShpLS0sIDEpXG5cdFx0XHR2YXIgciA9IGZuKCk7XG5cdFx0XHRpZiAociAhPT0gdW5kZWZpbmVkKSByZXN1bHQgPSByO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gbm8gYmFzZVVSSVxuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8uaiA9IChjaHVua0lkKSA9PiAoaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID09PSAwKTtcblxuLy8gaW5zdGFsbCBhIEpTT05QIGNhbGxiYWNrIGZvciBjaHVuayBsb2FkaW5nXG52YXIgd2VicGFja0pzb25wQ2FsbGJhY2sgPSAocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24sIGRhdGEpID0+IHtcblx0dmFyIFtjaHVua0lkcywgbW9yZU1vZHVsZXMsIHJ1bnRpbWVdID0gZGF0YTtcblx0Ly8gYWRkIFwibW9yZU1vZHVsZXNcIiB0byB0aGUgbW9kdWxlcyBvYmplY3QsXG5cdC8vIHRoZW4gZmxhZyBhbGwgXCJjaHVua0lkc1wiIGFzIGxvYWRlZCBhbmQgZmlyZSBjYWxsYmFja1xuXHR2YXIgbW9kdWxlSWQsIGNodW5rSWQsIGkgPSAwO1xuXHRpZihjaHVua0lkcy5zb21lKChpZCkgPT4gKGluc3RhbGxlZENodW5rc1tpZF0gIT09IDApKSkge1xuXHRcdGZvcihtb2R1bGVJZCBpbiBtb3JlTW9kdWxlcykge1xuXHRcdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKG1vcmVNb2R1bGVzLCBtb2R1bGVJZCkpIHtcblx0XHRcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tW21vZHVsZUlkXSA9IG1vcmVNb2R1bGVzW21vZHVsZUlkXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYocnVudGltZSkgdmFyIHJlc3VsdCA9IHJ1bnRpbWUoX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cdH1cblx0aWYocGFyZW50Q2h1bmtMb2FkaW5nRnVuY3Rpb24pIHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKGRhdGEpO1xuXHRmb3IoO2kgPCBjaHVua0lkcy5sZW5ndGg7IGkrKykge1xuXHRcdGNodW5rSWQgPSBjaHVua0lkc1tpXTtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oaW5zdGFsbGVkQ2h1bmtzLCBjaHVua0lkKSAmJiBpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0pIHtcblx0XHRcdGluc3RhbGxlZENodW5rc1tjaHVua0lkXVswXSgpO1xuXHRcdH1cblx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF0gPSAwO1xuXHR9XG5cdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fLk8ocmVzdWx0KTtcbn1cblxudmFyIGNodW5rTG9hZGluZ0dsb2JhbCA9IHNlbGZbXCJ3ZWJwYWNrQ2h1bmtjZ3ByZW5kZXJpbmdcIl0gPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdIHx8IFtdO1xuY2h1bmtMb2FkaW5nR2xvYmFsLmZvckVhY2god2VicGFja0pzb25wQ2FsbGJhY2suYmluZChudWxsLCAwKSk7XG5jaHVua0xvYWRpbmdHbG9iYWwucHVzaCA9IHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2guYmluZChjaHVua0xvYWRpbmdHbG9iYWwpKTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGRlcGVuZHMgb24gb3RoZXIgbG9hZGVkIGNodW5rcyBhbmQgZXhlY3V0aW9uIG5lZWQgdG8gYmUgZGVsYXllZFxudmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fLk8odW5kZWZpbmVkLCBbXCJ2ZW5kb3JzLW5vZGVfbW9kdWxlc190d2VlbmpzX3R3ZWVuX2pzX2Rpc3RfdHdlZW5fZXNtX2pzLW5vZGVfbW9kdWxlc19jYW5ub24tZXNfZGlzdF9jYW5ub24tZXMtYzQ4YmM5XCJdLCAoKSA9PiAoX193ZWJwYWNrX3JlcXVpcmVfXyhcIi4vc3JjL2FwcC50c1wiKSkpXG5fX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKF9fd2VicGFja19leHBvcnRzX18pO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9