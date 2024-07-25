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
        const sphereGeometry = new three__WEBPACK_IMPORTED_MODULE_4__.SphereGeometry(0.1, 32, 32);
        const sphereMaterial = new three__WEBPACK_IMPORTED_MODULE_4__.MeshLambertMaterial({ color: 0xff0000 });
        this.sphere = new three__WEBPACK_IMPORTED_MODULE_4__.Mesh(sphereGeometry, sphereMaterial);
        this.sphere.position.set(9.5, 1, 9.5);
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
                    let canvas = document.createElement('canvas');
                    canvas.width = 16;
                    canvas.height = 16;
                    let context = canvas.getContext('2d');
                    let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
                    gradient.addColorStop(0, 'rgba(255,255,255,1)');
                    gradient.addColorStop(0.2, 'rgba(255,0,0,1)');
                    gradient.addColorStop(0.4, 'rgba(64,0,0,1)');
                    gradient.addColorStop(1, 'rgba(0,0,0,1)');
                    context.fillStyle = gradient;
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    let texture = new three__WEBPACK_IMPORTED_MODULE_4__.Texture(canvas);
                    texture.needsUpdate = true;
                    return texture;
                };
                // パーティクルメッシュ生成
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
                // 花火の中心点生成
                this.particle = createPoints(new three__WEBPACK_IMPORTED_MODULE_4__.SphereGeometry(0.5, 64, 64));
                this.scene.add(this.particle);
            };
            createParticles();
            // パーティクルの動き
            let geometry = this.particle.geometry;
            let positions = geometry.getAttribute("position");
            positions.needsUpdate = true;
            for (let i = 0; i < positions.count; ++i) {
                let tweeninfo = {
                    x: positions.getX(i),
                    y: positions.getY(i),
                    z: positions.getZ(i),
                    index: i
                };
                let translatePosition = () => {
                    positions.setX(tweeninfo.index, tweeninfo.x);
                    positions.setY(tweeninfo.index, tweeninfo.y);
                    positions.setZ(tweeninfo.index, tweeninfo.z);
                    positions.needsUpdate = true;
                };
                // ランダムな位置への移動
                let targetPosition = {
                    x: tweeninfo.x + (Math.random() - 0.5) * 20,
                    y: tweeninfo.y + Math.random() * 20,
                    z: tweeninfo.z + (Math.random() - 0.5) * 20
                };
                // Tweenの作成とチェイン
                const tween1 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo)
                    .to({ x: tweeninfo.x, y: tweeninfo.y + 5, z: tweeninfo.z }, 1000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Quadratic.Out)
                    .onUpdate(translatePosition);
                const tween2 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo)
                    .to(targetPosition, 1000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Exponential.InOut)
                    .onUpdate(translatePosition);
                const tween3 = new _tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Tween(tweeninfo)
                    .to({ x: 0, y: 0, z: 0 }, 1000)
                    .easing(_tweenjs_tween_js__WEBPACK_IMPORTED_MODULE_0__.Easing.Quadratic.Out)
                    .onUpdate(translatePosition);
                tween1.chain(tween2);
                tween2.chain(tween1);
                tween1.start();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUs7V0FDTDtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1dDM0JBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztXQ05BOztXQUVBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTs7V0FFQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQSxNQUFNLHFCQUFxQjtXQUMzQjtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBOztXQUVBO1dBQ0E7V0FDQTs7Ozs7VUVoREE7VUFDQTtVQUNBO1VBQ0E7VUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL2NncHJlbmRlcmluZy8uL3NyYy9hcHAudHMiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvY2h1bmsgbG9hZGVkIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svcnVudGltZS9qc29ucCBjaHVuayBsb2FkaW5nIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL2JlZm9yZS1zdGFydHVwIiwid2VicGFjazovL2NncHJlbmRlcmluZy93ZWJwYWNrL3N0YXJ0dXAiLCJ3ZWJwYWNrOi8vY2dwcmVuZGVyaW5nL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvLzIyRkkwODUg6Y2L5bO25YSq5aSqXG5cbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gXCJ0aHJlZVwiO1xuaW1wb3J0ICogYXMgQ0FOTk9OIGZyb20gJ2Nhbm5vbi1lcyc7XG5pbXBvcnQgKiBhcyBUV0VFTiBmcm9tIFwiQHR3ZWVuanMvdHdlZW4uanNcIjtcbmltcG9ydCB7IE9yYml0Q29udHJvbHMgfSBmcm9tIFwidGhyZWUvZXhhbXBsZXMvanNtL2NvbnRyb2xzL09yYml0Q29udHJvbHNcIjtcbmltcG9ydCB7IE9CSkxvYWRlciB9IGZyb20gJ3RocmVlL2V4YW1wbGVzL2pzbS9sb2FkZXJzL09CSkxvYWRlcic7XG5pbXBvcnQgeyBNVExMb2FkZXIgfSBmcm9tICd0aHJlZS9leGFtcGxlcy9qc20vbG9hZGVycy9NVExMb2FkZXInO1xuXG5jbGFzcyBUaHJlZUpTQ29udGFpbmVyIHtcbiAgICBwcml2YXRlIHNjZW5lOiBUSFJFRS5TY2VuZTtcbiAgICBwcml2YXRlIGxpZ2h0OiBUSFJFRS5MaWdodDtcbiAgICBwcml2YXRlIHJvdGF0aW9uU3BlZWQ6IG51bWJlciA9IDUwOyAvLyAx56eS44GnNTDluqbjga7lm57ou6JcbiAgICBwcml2YXRlIG1heFJvdGF0aW9uOiBudW1iZXIgPSBUSFJFRS5NYXRoVXRpbHMuZGVnVG9SYWQoMjApOyAvLyDmnIDlpKcyMOW6plxuXG4gICAgcHJpdmF0ZSBjdXJyZW50Um90YXRpb25YOiBudW1iZXIgPSAwO1xuICAgIHByaXZhdGUgY3VycmVudFJvdGF0aW9uWTogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIHBsYXRlOiBUSFJFRS5PYmplY3QzRCB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgcGxhdGVCb2R5OiBDQU5OT04uQm9keSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgc3BoZXJlOiBUSFJFRS5NZXNoIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSBzcGhlcmVCb2R5OiBDQU5OT04uQm9keSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgd29ybGQ6IENBTk5PTi5Xb3JsZDtcblxuXG4gICAgcHJpdmF0ZSBnb2FsUG9zaXRpb246IFRIUkVFLlZlY3RvcjM7XG4gICAgcHJpdmF0ZSBnb2FsUmFkaXVzOiBudW1iZXI7XG4gICAgcHJpdmF0ZSBpc0NsZWFyZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIGdvYWxNZXNoOiBUSFJFRS5NZXNoO1xuXG4gICAgcHJpdmF0ZSBwYXJ0aWNsZTogVEhSRUUuUG9pbnRzO1xuICAgIHByaXZhdGUgb3JpZ2luOiBUSFJFRS5Qb2ludHM7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy53b3JsZCA9IG5ldyBDQU5OT04uV29ybGQoe1xuICAgICAgICAgICAgZ3Jhdml0eTogbmV3IENBTk5PTi5WZWMzKDAsIC05LjgyLCAwKVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy53b3JsZC5kZWZhdWx0Q29udGFjdE1hdGVyaWFsLmZyaWN0aW9uID0gMC4zO1xuICAgICAgICB0aGlzLndvcmxkLmRlZmF1bHRDb250YWN0TWF0ZXJpYWwucmVzdGl0dXRpb24gPSAwLjAxO1xuXG4gICAgICAgIHRoaXMuZ29hbFBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoOSwgLTEsIDkpO1xuICAgICAgICB0aGlzLmdvYWxSYWRpdXMgPSAxLjc1OyAgLy8g44K044O844Or44Gu5Yik5a6a56+E5ZuyXG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZVJlbmRlcmVyRE9NID0gKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBjYW1lcmFQb3M6IFRIUkVFLlZlY3RvcjMpID0+IHtcbiAgICAgICAgY29uc3QgcmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcigpO1xuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICByZW5kZXJlci5zZXRDbGVhckNvbG9yKG5ldyBUSFJFRS5Db2xvcigweDMwMzAzMCkpO1xuICAgICAgICByZW5kZXJlci5zaGFkb3dNYXAuZW5hYmxlZCA9IHRydWU7XG4gICAgICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSg3NSwgd2lkdGggLyBoZWlnaHQsIDAuMSwgMTAwMCk7XG4gICAgICAgIGNhbWVyYS5wb3NpdGlvbi5jb3B5KGNhbWVyYVBvcyk7XG4gICAgICAgIGNhbWVyYS5sb29rQXQobmV3IFRIUkVFLlZlY3RvcjMoMCwgMCwgMCkpO1xuICAgICAgICBjb25zdCBvcmJpdENvbnRyb2xzID0gbmV3IE9yYml0Q29udHJvbHMoY2FtZXJhLCByZW5kZXJlci5kb21FbGVtZW50KTtcbiAgICAgICAgdGhpcy5jcmVhdGVTY2VuZSgpO1xuXG4gICAgICAgIGNvbnN0IHJlbmRlcjogRnJhbWVSZXF1ZXN0Q2FsbGJhY2sgPSAodGltZSkgPT4ge1xuICAgICAgICAgICAgb3JiaXRDb250cm9scy51cGRhdGUoKTtcbiAgICAgICAgICAgIHJlbmRlcmVyLnJlbmRlcih0aGlzLnNjZW5lLCBjYW1lcmEpO1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XG5cbiAgICAgICAgcmVuZGVyZXIuZG9tRWxlbWVudC5zdHlsZS5jc3NGbG9hdCA9IFwibGVmdFwiO1xuICAgICAgICByZW5kZXJlci5kb21FbGVtZW50LnN0eWxlLm1hcmdpbiA9IFwiMTBweFwiO1xuICAgICAgICByZXR1cm4gcmVuZGVyZXIuZG9tRWxlbWVudDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNyZWF0ZVNjZW5lID0gKCkgPT4ge1xuICAgICAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG5cbiAgICAgICAgLy9nb2Fs5Yik5a6a44CAb3BhY2l0eeOBp+mAj+aYjuW6puWkieOBiOOBpueiuuiqjVxuICAgICAgICBjb25zdCBnb2FsR2VvbWV0cnkgPSBuZXcgVEhSRUUuQm94R2VvbWV0cnkodGhpcy5nb2FsUmFkaXVzLHRoaXMuZ29hbFJhZGl1cyx0aGlzLmdvYWxSYWRpdXMpO1xuICAgICAgICBjb25zdCBnb2FsTWF0ZXJpYWwgPSBuZXcgVEhSRUUuTWVzaEJhc2ljTWF0ZXJpYWwoeyBjb2xvcjogMHgwMGZmMDAsIHRyYW5zcGFyZW50OiB0cnVlLCBvcGFjaXR5OiAwIH0pO1xuICAgICAgICB0aGlzLmdvYWxNZXNoID0gbmV3IFRIUkVFLk1lc2goZ29hbEdlb21ldHJ5LCBnb2FsTWF0ZXJpYWwpO1xuICAgICAgICB0aGlzLmdvYWxNZXNoLnBvc2l0aW9uLmNvcHkodGhpcy5nb2FsUG9zaXRpb24pO1xuICAgICAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmdvYWxNZXNoKTtcblxuICAgICAgICAvL+i7uOOBqOOCsOODquODg+ODiFxuICAgICAgICAvLyBjb25zdCBncmlkSGVscGVyID0gbmV3IFRIUkVFLkdyaWRIZWxwZXIoMTAwKTtcbiAgICAgICAgLy8gdGhpcy5zY2VuZS5hZGQoZ3JpZEhlbHBlcik7XG4gICAgICAgIC8vIGNvbnN0IGF4ZXNIZWxwZXIgPSBuZXcgVEhSRUUuQXhlc0hlbHBlcigxMCk7XG4gICAgICAgIC8vIHRoaXMuc2NlbmUuYWRkKGF4ZXNIZWxwZXIpO1xuXG4gICAgICAgIC8v44Op44Kk44OIXG4gICAgICAgIHRoaXMubGlnaHQgPSBuZXcgVEhSRUUuRGlyZWN0aW9uYWxMaWdodCgweGZmZmZmZik7XG4gICAgICAgIGNvbnN0IGx2ZWMgPSBuZXcgVEhSRUUuVmVjdG9yMygxLCAxLCAxKS5ub3JtYWxpemUoKTtcbiAgICAgICAgdGhpcy5saWdodC5wb3NpdGlvbi5zZXQobHZlYy54LCBsdmVjLnksIGx2ZWMueik7XG4gICAgICAgIHRoaXMuc2NlbmUuYWRkKHRoaXMubGlnaHQpO1xuXG4gICAgICAgIC8vb2Jq44OV44Kh44Kk44Or44GobXRs44OV44Kh44Kk44Or44Gu6Kqt44G/6L6844G/77yI6L+36Lev77yJXG4gICAgICAgIGNvbnN0IG10bExvYWRlciA9IG5ldyBNVExMb2FkZXIoKTtcbiAgICAgICAgbXRsTG9hZGVyLmxvYWQoJ21laXJvLm10bCcsIChtYXRlcmlhbHMpID0+IHtcbiAgICAgICAgICAgIG1hdGVyaWFscy5wcmVsb2FkKCk7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgbWF0ZXJpYWwgb2YgT2JqZWN0LnZhbHVlcyhtYXRlcmlhbHMubWF0ZXJpYWxzKSkge1xuICAgICAgICAgICAgICAgIG1hdGVyaWFsLnNpZGUgPSBUSFJFRS5Eb3VibGVTaWRlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBvYmpMb2FkZXIgPSBuZXcgT0JKTG9hZGVyKCk7XG4gICAgICAgICAgICBvYmpMb2FkZXIuc2V0TWF0ZXJpYWxzKG1hdGVyaWFscyk7XG4gICAgICAgICAgICBvYmpMb2FkZXIubG9hZCgnbWVpcm8ub2JqJywgKG9iamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGxhdGUgPSBvYmplY3Q7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQob2JqZWN0KTtcbiAgICAgICAgICAgICAgICBvYmplY3QucG9zaXRpb24uc2V0KDAsIDAsIDApO1xuXG4gICAgICAgICAgICAgICAgLy8gT0JK44GL44KJ6aCC54K55oOF5aCx44KS5oq95Ye6XG4gICAgICAgICAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSAob2JqZWN0LmNoaWxkcmVuWzBdIGFzIFRIUkVFLk1lc2gpLmdlb21ldHJ5O1xuICAgICAgICAgICAgICAgIGdlb21ldHJ5LmNvbXB1dGVWZXJ0ZXhOb3JtYWxzKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zaXRpb25BdHRyaWJ1dGUgPSBnZW9tZXRyeS5nZXRBdHRyaWJ1dGUoJ3Bvc2l0aW9uJyk7XG4gICAgICAgICAgICAgICAgY29uc3QgdmVydGljZXMgPSBbXTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9uQXR0cmlidXRlLmNvdW50OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uQXR0cmlidXRlLmdldFgoaSksXG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbkF0dHJpYnV0ZS5nZXRZKGkpLFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25BdHRyaWJ1dGUuZ2V0WihpKVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOOCpOODs+ODh+ODg+OCr+OCueOBruWPluW+l+OBvuOBn+OBr+eUn+aIkFxuICAgICAgICAgICAgICAgIGxldCBpbmRpY2VzOiBudW1iZXJbXTtcbiAgICAgICAgICAgICAgICBpZiAoZ2VvbWV0cnkuaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcyA9IEFycmF5LmZyb20oZ2VvbWV0cnkuaW5kZXguYXJyYXkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbkF0dHJpYnV0ZS5jb3VudDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDQU5OT04uZXPjga5UcmltZXNo44KS5L2c5oiQXG4gICAgICAgICAgICAgICAgY29uc3Qgc2hhcGUgPSBuZXcgQ0FOTk9OLlRyaW1lc2godmVydGljZXMsIGluZGljZXMpO1xuXG4gICAgICAgICAgICAgICAgLy8g54mp55CG5ryU566X44Gu44Gf44KB44Gu6Kit5a6aXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF0ZUJvZHkgPSBuZXcgQ0FOTk9OLkJvZHkoeyBtYXNzOiAwIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMucGxhdGVCb2R5LmFkZFNoYXBlKHNoYXBlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXRlQm9keS5wb3NpdGlvbi5jb3B5KG9iamVjdC5wb3NpdGlvbiBhcyB1bmtub3duIGFzIENBTk5PTi5WZWMzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXRlQm9keS5pbnRlcnBvbGF0ZWRRdWF0ZXJuaW9uXG4gICAgICAgICAgICAgICAgdGhpcy53b3JsZC5hZGRCb2R5KHRoaXMucGxhdGVCb2R5KTtcbiAgICAgICAgICAgIH0sICh4aHIpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygoeGhyLmxvYWRlZCAvIHhoci50b3RhbCAqIDEwMCkgKyAnJSBsb2FkZWQnKTtcbiAgICAgICAgICAgIH0sIChlcnJvcikgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBbiBlcnJvciBoYXBwZW5lZCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOOCueODleOCo+OCouOBruS9nOaIkOOBqOi/veWKoFxuICAgICAgICBjb25zdCBzcGhlcmVHZW9tZXRyeSA9IG5ldyBUSFJFRS5TcGhlcmVHZW9tZXRyeSgwLjEsIDMyLCAzMik7XG4gICAgICAgIGNvbnN0IHNwaGVyZU1hdGVyaWFsID0gbmV3IFRIUkVFLk1lc2hMYW1iZXJ0TWF0ZXJpYWwoeyBjb2xvcjogMHhmZjAwMDAgfSk7XG4gICAgICAgIHRoaXMuc3BoZXJlID0gbmV3IFRIUkVFLk1lc2goc3BoZXJlR2VvbWV0cnksIHNwaGVyZU1hdGVyaWFsKTtcbiAgICAgICAgdGhpcy5zcGhlcmUucG9zaXRpb24uc2V0KDkuNSwgMSwgOS41KTtcbiAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5zcGhlcmUpO1xuXG4gICAgICAgIC8vIOeJqeeQhua8lOeul+OBruOBn+OCgeOBruOCueODleOCo+OCouioreWumlxuICAgICAgICBjb25zdCBzcGhlcmVTaGFwZSA9IG5ldyBDQU5OT04uU3BoZXJlKDAuNSk7XG4gICAgICAgIHRoaXMuc3BoZXJlQm9keSA9IG5ldyBDQU5OT04uQm9keSh7IG1hc3M6IDEgfSk7XG4gICAgICAgIHRoaXMuc3BoZXJlQm9keS5hZGRTaGFwZShzcGhlcmVTaGFwZSk7XG4gICAgICAgIHRoaXMuc3BoZXJlQm9keS5wb3NpdGlvbi5jb3B5KHRoaXMuc3BoZXJlLnBvc2l0aW9uIGFzIHVua25vd24gYXMgQ0FOTk9OLlZlYzMpO1xuICAgICAgICB0aGlzLndvcmxkLmFkZEJvZHkodGhpcy5zcGhlcmVCb2R5KTtcblxuICAgICAgICAvL+Wbnui7ou+8iOinkuW6puS7mOOBke+8iSDov7fot6/vvIvjgrTjg7zjg6vliKTlrppcbiAgICAgICAgY29uc3Qgcm90YXRlT2JqZWN0ID0gKGRpcmVjdGlvbjogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucGxhdGVCb2R5KSByZXR1cm47XG5cbiAgICAgICAgICAgIGNvbnN0IGRlbHRhID0gVEhSRUUuTWF0aFV0aWxzLmRlZ1RvUmFkKHRoaXMucm90YXRpb25TcGVlZCAvIDYwKTsgLy8gNjAgRlBT5Z+65rqWXG4gICAgICAgICAgICBjb25zdCByb3RhdGlvblF1YXRlcm5pb24gPSBuZXcgQ0FOTk9OLlF1YXRlcm5pb24oKTtcblxuXG4gICAgICAgICAgICBzd2l0Y2ggKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93VXAnOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50Um90YXRpb25YIC0gZGVsdGEgPj0gLXRoaXMubWF4Um90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uWCAtPSBkZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uUXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKG5ldyBDQU5OT04uVmVjMygxLCAwLCAwKSwgLWRlbHRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMSwwLDApLCAtZGVsdGEgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gudHJhbnNsYXRlT25BeGlzKG5ldyBUSFJFRS5WZWN0b3IzKDAsLTAuOTksMC4wMSkubm9ybWFsaXplKCksIC1kZWx0YSo5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoaXMuZ29hbE1lc2gucm90YXRlWChkZWx0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnQXJyb3dEb3duJzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uWCArIGRlbHRhIDw9IHRoaXMubWF4Um90YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJvdGF0aW9uWCArPSBkZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uUXVhdGVybmlvbi5zZXRGcm9tQXhpc0FuZ2xlKG5ldyBDQU5OT04uVmVjMygxLCAwLCAwKSwgZGVsdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC5yb3RhdGVPbldvcmxkQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygxLDAsMCksIGRlbHRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnRyYW5zbGF0ZU9uQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygwLC0wLjk5LDAuMDEpLm5vcm1hbGl6ZSgpLCBkZWx0YSo5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdBcnJvd1JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY3VycmVudFJvdGF0aW9uWSAtIGRlbHRhID49IC10aGlzLm1heFJvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvblkgLT0gZGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvblF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZShuZXcgQ0FOTk9OLlZlYzMoMCwgMCwgMSksIC1kZWx0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnJvdGF0ZU9uV29ybGRBeGlzKG5ldyBUSFJFRS5WZWN0b3IzKDAsMCwxKSwgLWRlbHRhICk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmdvYWxNZXNoLnRyYW5zbGF0ZU9uQXhpcyhuZXcgVEhSRUUuVmVjdG9yMygwLjAxLDAuOTksMCkubm9ybWFsaXplKCksIC1kZWx0YSo5KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0Fycm93TGVmdCc6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnJlbnRSb3RhdGlvblkgKyBkZWx0YSA8PSB0aGlzLm1heFJvdGF0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRSb3RhdGlvblkgKz0gZGVsdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3RhdGlvblF1YXRlcm5pb24uc2V0RnJvbUF4aXNBbmdsZShuZXcgQ0FOTk9OLlZlYzMoMCwgMCwgMSksIGRlbHRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZ29hbE1lc2gucm90YXRlT25Xb3JsZEF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMCwwLDEpLCBkZWx0YSApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb2FsTWVzaC50cmFuc2xhdGVPbkF4aXMobmV3IFRIUkVFLlZlY3RvcjMoMC4wMSwwLjk5LDApLm5vcm1hbGl6ZSgpLCBkZWx0YSo5KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnBsYXRlQm9keS5xdWF0ZXJuaW9uID0gdGhpcy5wbGF0ZUJvZHkucXVhdGVybmlvbi5tdWx0KHJvdGF0aW9uUXVhdGVybmlvbik7XG4gICAgICAgIH1cblxuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgcm90YXRlT2JqZWN0KGV2ZW50LmtleSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLy/jgq/jg6rjgqLjgqjjg5Xjgqfjgq/jg4hcbiAgICAgICAgY29uc3Qgc2hvd0NsZWFyRWZmZWN0ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJDbGVhciEhIVwiKTtcblxuICAgICAgICAgICAgbGV0IGNyZWF0ZVBhcnRpY2xlcyA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgZ2VuZXJhdGVTcHJpdGUgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gMTY7XG4gICAgICAgICAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSAxNjtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGdyYWRpZW50ID0gY29udGV4dC5jcmVhdGVSYWRpYWxHcmFkaWVudChcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbnZhcy53aWR0aCAvIDIsIGNhbnZhcy5oZWlnaHQgLyAyLCAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2FudmFzLndpZHRoIC8gMiwgY2FudmFzLmhlaWdodCAvIDIsIGNhbnZhcy53aWR0aCAvIDJcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdyZ2JhKDI1NSwyNTUsMjU1LDEpJyk7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLjIsICdyZ2JhKDI1NSwwLDAsMSknKTtcbiAgICAgICAgICAgICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAuNCwgJ3JnYmEoNjQsMCwwLDEpJyk7XG4gICAgICAgICAgICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgwLDAsMCwxKScpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgICAgICAgICAgICAgICBjb250ZXh0LmZpbGxSZWN0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGxldCB0ZXh0dXJlID0gbmV3IFRIUkVFLlRleHR1cmUoY2FudmFzKTtcbiAgICAgICAgICAgICAgICAgICAgdGV4dHVyZS5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOODkeODvOODhuOCo+OCr+ODq+ODoeODg+OCt+ODpeeUn+aIkFxuICAgICAgICAgICAgICAgIGxldCBjcmVhdGVQb2ludHMgPSAoZ2VvbTogVEhSRUUuQnVmZmVyR2VvbWV0cnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG1hdGVyaWFsID0gbmV3IFRIUkVFLlBvaW50c01hdGVyaWFsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiAweGZmZmZmZixcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemU6IDAuMyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyYW5zcGFyZW50OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aFdyaXRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcDogZ2VuZXJhdGVTcHJpdGUoKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBUSFJFRS5Qb2ludHMoZ2VvbSwgbWF0ZXJpYWwpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOiKseeBq+OBruS4reW/g+eCueeUn+aIkFxuICAgICAgICAgICAgICAgIHRoaXMucGFydGljbGUgPSBjcmVhdGVQb2ludHMobmV3IFRIUkVFLlNwaGVyZUdlb21ldHJ5KDAuNSwgNjQsIDY0KSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5wYXJ0aWNsZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNyZWF0ZVBhcnRpY2xlcygpO1xuXG4gICAgICAgICAgICAvLyDjg5Hjg7zjg4bjgqPjgq/jg6vjga7li5XjgY1cbiAgICAgICAgICAgIGxldCBnZW9tZXRyeSA9IDxUSFJFRS5CdWZmZXJHZW9tZXRyeT50aGlzLnBhcnRpY2xlLmdlb21ldHJ5O1xuICAgICAgICAgICAgbGV0IHBvc2l0aW9ucyA9IGdlb21ldHJ5LmdldEF0dHJpYnV0ZShcInBvc2l0aW9uXCIpO1xuICAgICAgICAgICAgcG9zaXRpb25zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnMuY291bnQ7ICsraSkge1xuICAgICAgICAgICAgICAgIGxldCB0d2VlbmluZm8gPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHBvc2l0aW9ucy5nZXRYKGkpLFxuICAgICAgICAgICAgICAgICAgICB5OiBwb3NpdGlvbnMuZ2V0WShpKSxcbiAgICAgICAgICAgICAgICAgICAgejogcG9zaXRpb25zLmdldFooaSksXG4gICAgICAgICAgICAgICAgICAgIGluZGV4OiBpXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIGxldCB0cmFuc2xhdGVQb3NpdGlvbiA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLnNldFgodHdlZW5pbmZvLmluZGV4LCB0d2VlbmluZm8ueCk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5zZXRZKHR3ZWVuaW5mby5pbmRleCwgdHdlZW5pbmZvLnkpO1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMuc2V0Wih0d2VlbmluZm8uaW5kZXgsIHR3ZWVuaW5mby56KTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zLm5lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyDjg6njg7Pjg4Djg6DjgarkvY3nva7jgbjjga7np7vli5VcbiAgICAgICAgICAgICAgICBsZXQgdGFyZ2V0UG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHR3ZWVuaW5mby54ICsgKE1hdGgucmFuZG9tKCkgLSAwLjUpICogMjAsXG4gICAgICAgICAgICAgICAgICAgIHk6IHR3ZWVuaW5mby55ICsgTWF0aC5yYW5kb20oKSAqIDIwLFxuICAgICAgICAgICAgICAgICAgICB6OiB0d2VlbmluZm8ueiArIChNYXRoLnJhbmRvbSgpIC0gMC41KSAqIDIwXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIC8vIFR3ZWVu44Gu5L2c5oiQ44Go44OB44Kn44Kk44OzXG4gICAgICAgICAgICAgICAgY29uc3QgdHdlZW4xID0gbmV3IFRXRUVOLlR3ZWVuKHR3ZWVuaW5mbylcbiAgICAgICAgICAgICAgICAgICAgLnRvKHsgeDogdHdlZW5pbmZvLngsIHk6IHR3ZWVuaW5mby55ICsgNSwgejogdHdlZW5pbmZvLnogfSwgMTAwMClcbiAgICAgICAgICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuUXVhZHJhdGljLk91dClcbiAgICAgICAgICAgICAgICAgICAgLm9uVXBkYXRlKHRyYW5zbGF0ZVBvc2l0aW9uKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHR3ZWVuMiA9IG5ldyBUV0VFTi5Ud2Vlbih0d2VlbmluZm8pXG4gICAgICAgICAgICAgICAgICAgIC50byh0YXJnZXRQb3NpdGlvbiwgMTAwMClcbiAgICAgICAgICAgICAgICAgICAgLmVhc2luZyhUV0VFTi5FYXNpbmcuRXhwb25lbnRpYWwuSW5PdXQpXG4gICAgICAgICAgICAgICAgICAgIC5vblVwZGF0ZSh0cmFuc2xhdGVQb3NpdGlvbik7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB0d2VlbjMgPSBuZXcgVFdFRU4uVHdlZW4odHdlZW5pbmZvKVxuICAgICAgICAgICAgICAgICAgICAudG8oeyB4OiAwLCB5OiAwICwgejogMCB9LCAxMDAwKVxuICAgICAgICAgICAgICAgICAgICAuZWFzaW5nKFRXRUVOLkVhc2luZy5RdWFkcmF0aWMuT3V0KVxuICAgICAgICAgICAgICAgICAgICAub25VcGRhdGUodHJhbnNsYXRlUG9zaXRpb24pO1xuXG4gICAgICAgICAgICAgICAgdHdlZW4xLmNoYWluKHR3ZWVuMik7XG4gICAgICAgICAgICAgICAgdHdlZW4yLmNoYWluKHR3ZWVuMSk7XG4gICAgICAgICAgICAgICAgdHdlZW4xLnN0YXJ0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCr+ODquOCouWIpOWumlxuICAgICAgICBjb25zdCBjaGVja0dvYWwgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5zcGhlcmUgJiYgIXRoaXMuaXNDbGVhcmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSB0aGlzLnNwaGVyZS5wb3NpdGlvbi5kaXN0YW5jZVRvKHRoaXMuZ29hbE1lc2gucG9zaXRpb24pO1xuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8PSB0aGlzLmdvYWxSYWRpdXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NsZWFyZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzaG93Q2xlYXJFZmZlY3QoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG5cblxuICAgICAgICBsZXQgdXBkYXRlOiBGcmFtZVJlcXVlc3RDYWxsYmFjayA9ICh0aW1lKSA9PiB7XG4gICAgICAgICAgICB0aGlzLndvcmxkLmZpeGVkU3RlcCgpO1xuICAgICAgICAgICAgaWYgKHRoaXMucGxhdGUgJiYgdGhpcy5wbGF0ZUJvZHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXRlLnBvc2l0aW9uLmNvcHkodGhpcy5wbGF0ZUJvZHkucG9zaXRpb24gYXMgdW5rbm93biBhcyBUSFJFRS5WZWN0b3IzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXRlLnF1YXRlcm5pb24uY29weSh0aGlzLnBsYXRlQm9keS5xdWF0ZXJuaW9uIGFzIHVua25vd24gYXMgVEhSRUUuUXVhdGVybmlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zcGhlcmUgJiYgdGhpcy5zcGhlcmVCb2R5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zcGhlcmUucG9zaXRpb24uY29weSh0aGlzLnNwaGVyZUJvZHkucG9zaXRpb24gYXMgdW5rbm93biBhcyBUSFJFRS5WZWN0b3IzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwaGVyZS5xdWF0ZXJuaW9uLmNvcHkodGhpcy5zcGhlcmVCb2R5LnF1YXRlcm5pb24gYXMgdW5rbm93biBhcyBUSFJFRS5RdWF0ZXJuaW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hlY2tHb2FsKClcbiAgICAgICAgICAgIFRXRUVOLnVwZGF0ZSgpO1xuXG4gICAgICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodXBkYXRlKTtcbiAgICB9XG59XG5cblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGluaXQpO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIGxldCBjb250YWluZXIgPSBuZXcgVGhyZWVKU0NvbnRhaW5lcigpO1xuXG4gICAgbGV0IHZpZXdwb3J0ID0gY29udGFpbmVyLmNyZWF0ZVJlbmRlcmVyRE9NKDY0MCwgNDgwLCBuZXcgVEhSRUUuVmVjdG9yMygwLCAyMCwgMTUpKTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHZpZXdwb3J0KTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4vLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuX193ZWJwYWNrX3JlcXVpcmVfXy5tID0gX193ZWJwYWNrX21vZHVsZXNfXztcblxuIiwidmFyIGRlZmVycmVkID0gW107XG5fX3dlYnBhY2tfcmVxdWlyZV9fLk8gPSAocmVzdWx0LCBjaHVua0lkcywgZm4sIHByaW9yaXR5KSA9PiB7XG5cdGlmKGNodW5rSWRzKSB7XG5cdFx0cHJpb3JpdHkgPSBwcmlvcml0eSB8fCAwO1xuXHRcdGZvcih2YXIgaSA9IGRlZmVycmVkLmxlbmd0aDsgaSA+IDAgJiYgZGVmZXJyZWRbaSAtIDFdWzJdID4gcHJpb3JpdHk7IGktLSkgZGVmZXJyZWRbaV0gPSBkZWZlcnJlZFtpIC0gMV07XG5cdFx0ZGVmZXJyZWRbaV0gPSBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV07XG5cdFx0cmV0dXJuO1xuXHR9XG5cdHZhciBub3RGdWxmaWxsZWQgPSBJbmZpbml0eTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBkZWZlcnJlZC5sZW5ndGg7IGkrKykge1xuXHRcdHZhciBbY2h1bmtJZHMsIGZuLCBwcmlvcml0eV0gPSBkZWZlcnJlZFtpXTtcblx0XHR2YXIgZnVsZmlsbGVkID0gdHJ1ZTtcblx0XHRmb3IgKHZhciBqID0gMDsgaiA8IGNodW5rSWRzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRpZiAoKHByaW9yaXR5ICYgMSA9PT0gMCB8fCBub3RGdWxmaWxsZWQgPj0gcHJpb3JpdHkpICYmIE9iamVjdC5rZXlzKF9fd2VicGFja19yZXF1aXJlX18uTykuZXZlcnkoKGtleSkgPT4gKF9fd2VicGFja19yZXF1aXJlX18uT1trZXldKGNodW5rSWRzW2pdKSkpKSB7XG5cdFx0XHRcdGNodW5rSWRzLnNwbGljZShqLS0sIDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZnVsZmlsbGVkID0gZmFsc2U7XG5cdFx0XHRcdGlmKHByaW9yaXR5IDwgbm90RnVsZmlsbGVkKSBub3RGdWxmaWxsZWQgPSBwcmlvcml0eTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYoZnVsZmlsbGVkKSB7XG5cdFx0XHRkZWZlcnJlZC5zcGxpY2UoaS0tLCAxKVxuXHRcdFx0dmFyIHIgPSBmbigpO1xuXHRcdFx0aWYgKHIgIT09IHVuZGVmaW5lZCkgcmVzdWx0ID0gcjtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJlc3VsdDtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIG5vIGJhc2VVUklcblxuLy8gb2JqZWN0IHRvIHN0b3JlIGxvYWRlZCBhbmQgbG9hZGluZyBjaHVua3Ncbi8vIHVuZGVmaW5lZCA9IGNodW5rIG5vdCBsb2FkZWQsIG51bGwgPSBjaHVuayBwcmVsb2FkZWQvcHJlZmV0Y2hlZFxuLy8gW3Jlc29sdmUsIHJlamVjdCwgUHJvbWlzZV0gPSBjaHVuayBsb2FkaW5nLCAwID0gY2h1bmsgbG9hZGVkXG52YXIgaW5zdGFsbGVkQ2h1bmtzID0ge1xuXHRcIm1haW5cIjogMFxufTtcblxuLy8gbm8gY2h1bmsgb24gZGVtYW5kIGxvYWRpbmdcblxuLy8gbm8gcHJlZmV0Y2hpbmdcblxuLy8gbm8gcHJlbG9hZGVkXG5cbi8vIG5vIEhNUlxuXG4vLyBubyBITVIgbWFuaWZlc3RcblxuX193ZWJwYWNrX3JlcXVpcmVfXy5PLmogPSAoY2h1bmtJZCkgPT4gKGluc3RhbGxlZENodW5rc1tjaHVua0lkXSA9PT0gMCk7XG5cbi8vIGluc3RhbGwgYSBKU09OUCBjYWxsYmFjayBmb3IgY2h1bmsgbG9hZGluZ1xudmFyIHdlYnBhY2tKc29ucENhbGxiYWNrID0gKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uLCBkYXRhKSA9PiB7XG5cdHZhciBbY2h1bmtJZHMsIG1vcmVNb2R1bGVzLCBydW50aW1lXSA9IGRhdGE7XG5cdC8vIGFkZCBcIm1vcmVNb2R1bGVzXCIgdG8gdGhlIG1vZHVsZXMgb2JqZWN0LFxuXHQvLyB0aGVuIGZsYWcgYWxsIFwiY2h1bmtJZHNcIiBhcyBsb2FkZWQgYW5kIGZpcmUgY2FsbGJhY2tcblx0dmFyIG1vZHVsZUlkLCBjaHVua0lkLCBpID0gMDtcblx0aWYoY2h1bmtJZHMuc29tZSgoaWQpID0+IChpbnN0YWxsZWRDaHVua3NbaWRdICE9PSAwKSkpIHtcblx0XHRmb3IobW9kdWxlSWQgaW4gbW9yZU1vZHVsZXMpIHtcblx0XHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhtb3JlTW9kdWxlcywgbW9kdWxlSWQpKSB7XG5cdFx0XHRcdF9fd2VicGFja19yZXF1aXJlX18ubVttb2R1bGVJZF0gPSBtb3JlTW9kdWxlc1ttb2R1bGVJZF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmKHJ1bnRpbWUpIHZhciByZXN1bHQgPSBydW50aW1lKF9fd2VicGFja19yZXF1aXJlX18pO1xuXHR9XG5cdGlmKHBhcmVudENodW5rTG9hZGluZ0Z1bmN0aW9uKSBwYXJlbnRDaHVua0xvYWRpbmdGdW5jdGlvbihkYXRhKTtcblx0Zm9yKDtpIDwgY2h1bmtJZHMubGVuZ3RoOyBpKyspIHtcblx0XHRjaHVua0lkID0gY2h1bmtJZHNbaV07XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGluc3RhbGxlZENodW5rcywgY2h1bmtJZCkgJiYgaW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdKSB7XG5cdFx0XHRpbnN0YWxsZWRDaHVua3NbY2h1bmtJZF1bMF0oKTtcblx0XHR9XG5cdFx0aW5zdGFsbGVkQ2h1bmtzW2NodW5rSWRdID0gMDtcblx0fVxuXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHJlc3VsdCk7XG59XG5cbnZhciBjaHVua0xvYWRpbmdHbG9iYWwgPSBzZWxmW1wid2VicGFja0NodW5rY2dwcmVuZGVyaW5nXCJdID0gc2VsZltcIndlYnBhY2tDaHVua2NncHJlbmRlcmluZ1wiXSB8fCBbXTtcbmNodW5rTG9hZGluZ0dsb2JhbC5mb3JFYWNoKHdlYnBhY2tKc29ucENhbGxiYWNrLmJpbmQobnVsbCwgMCkpO1xuY2h1bmtMb2FkaW5nR2xvYmFsLnB1c2ggPSB3ZWJwYWNrSnNvbnBDYWxsYmFjay5iaW5kKG51bGwsIGNodW5rTG9hZGluZ0dsb2JhbC5wdXNoLmJpbmQoY2h1bmtMb2FkaW5nR2xvYmFsKSk7IiwiIiwiLy8gc3RhcnR1cFxuLy8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vLyBUaGlzIGVudHJ5IG1vZHVsZSBkZXBlbmRzIG9uIG90aGVyIGxvYWRlZCBjaHVua3MgYW5kIGV4ZWN1dGlvbiBuZWVkIHRvIGJlIGRlbGF5ZWRcbnZhciBfX3dlYnBhY2tfZXhwb3J0c19fID0gX193ZWJwYWNrX3JlcXVpcmVfXy5PKHVuZGVmaW5lZCwgW1widmVuZG9ycy1ub2RlX21vZHVsZXNfdHdlZW5qc190d2Vlbl9qc19kaXN0X3R3ZWVuX2VzbV9qcy1ub2RlX21vZHVsZXNfY2Fubm9uLWVzX2Rpc3RfY2Fubm9uLWVzLWM0OGJjOVwiXSwgKCkgPT4gKF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9hcHAudHNcIikpKVxuX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18uTyhfX3dlYnBhY2tfZXhwb3J0c19fKTtcbiIsIiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==