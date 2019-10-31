function Initialize(opt) {
    var camera, controls, scene, renderer;
    var clock = new THREE.Clock();
    var thm = this;
    var df_Mouse, df_Raycaster;
    var df_Width, df_Height; //当前盒子的高宽
    var df_canvas;
    var transformControls;
    var DragMeshs = [];
    var currMesh = null;
    var composer;
    var renderScene;
    var bloomPass;
    thm.isDrag = true;
    var params = {
        exposure: 1,
        bloomStrength: 0.35,
        bloomThreshold: 0,
        bloomRadius: 0
    };
    var _cs = {
        color: "#5588aa",
        tcolor: "#ff9800"
    }
    function init() {
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.set(0, 80, 50);
        camera.lookAt(new THREE.Vector3(0, 0, 0))
        scene = new THREE.Scene();

        scene.background = new THREE.Color(0x000000);

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.querySelector(opt.id).appendChild(renderer.domElement);
        df_canvas = renderer.domElement
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        window.addEventListener('resize', onWindowResize, false);
        renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);


        scene.add(new THREE.AmbientLight(0x404040));
        pointLight = new THREE.PointLight(0xffffff, 1);
        camera.add(pointLight);


        renderScene = new THREE.RenderPass(scene, camera);

        bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.threshold = params.bloomThreshold;
        bloomPass.strength = params.bloomStrength;
        bloomPass.radius = params.bloomRadius;


        composer = new THREE.EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);


        df_Width = window.innerWidth;
        df_Height = window.innerHeight;
        df_Mouse = new THREE.Vector2();
        df_Raycaster = new THREE.Raycaster();
        // onload 
        if (opt.load) {
            opt.load({
                camera, controls, scene, renderer, DragMeshs
            })
        }
        if (Stats) {
            stats = new Stats();
            document.querySelector(opt.id).appendChild(stats.dom);
        }
        if (controls && THREE.TransformControls) {
            controls.addEventListener('start', function () {
                cancelHideTransform();
            });

            controls.addEventListener('end', function () {
                delayHideTransform();
            });

            transformControl = new THREE.TransformControls(camera, renderer.domElement);
            // transformControl.addEventListener('change', render);
            transformControl.addEventListener('dragging-changed', function (event) {
                controls.enabled = !event.value;

            });
            scene.add(transformControl);

            // Hiding transform situation is a little in a mess :()
            transformControl.addEventListener('change', function (o) {

                if (currMesh) {
                    if (currMesh._type === "drag") {
                        DragMeshs.forEach(x => {
                            if (x.uuid === currMesh._target) {
                                x.position.x = currMesh.position.x
                                x.position.y = currMesh.position.y - x.options.y / 2
                                x.position.z = currMesh.position.z
                            }
                        })
                        /* */
                    } else if (currMesh._type === "dragLine") {
                        var parent = currMesh.parent;
                        let drags = parent.children.filter(x => x._type === currMesh._type)
                        let line = parent.children.filter(x => x._type !== currMesh._type)
                        var positions = drags.map(elem => {
                            return new THREE.Vector3(...Object.values(elem.position))
                        })
                        var curve = new THREE.CatmullRomCurve3(positions);
                        var points = curve.getPoints(200);
                        line[0].geometry.setFromPoints(points);
                    }
                }
                cancelHideTransform();
            });

            transformControl.addEventListener('mouseDown', function () {

                cancelHideTransform();

            });

            transformControl.addEventListener('mouseUp', function () {

                delayHideTransform();

            });

            transformControl.addEventListener('objectChange', function () {

            });
            var dragcontrols = new THREE.DragControls(DragMeshs, camera, renderer.domElement); //
            dragcontrols.enabled = false;
            dragcontrols.addEventListener('hoveron', function (event) {
                if (thm.isDrag) {
                    transformControl.attach(event.object);
                    currMesh = event.object
                    cancelHideTransform();
                }
            });

            dragcontrols.addEventListener('hoveroff', function () {
                delayHideTransform();

            });

            var hiding;

            function delayHideTransform() {
                cancelHideTransform();
                hideTransform();
            }

            function hideTransform() {
                hiding = setTimeout(function () {
                    transformControl.detach(transformControl.object);
                }, 2000);

            }
            function cancelHideTransform() {
                if (hiding) {
                    clearTimeout(hiding);
                }
            }

        }
    }
    var gui = new dat.GUI();
    var guiAdd = gui.addFolder("基础");
    guiAdd.add(params, 'exposure', 0.1, 2).onChange(function (value) {
        renderer.toneMappingExposure = Math.pow(value, 4.0);
    });
    guiAdd.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
        bloomPass.threshold = Number(value);
    });
    guiAdd.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
        bloomPass.strength = Number(value);
    });
    guiAdd.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
        bloomPass.radius = Number(value);
    });
    guiAdd.addColor(_cs, 'color').onChange(function (value) {
        let city = scene.children.filter(elem => elem.name == "city")[0];
        city.children[0].material.uniforms.u_color.value = new THREE.Color(value);
    });
    guiAdd.addColor(_cs, 'tcolor').onChange(function (value) {
        let city = scene.children.filter(elem => elem.name == "city")[0];
        city.children[0].material.uniforms.u_tcolor.value = new THREE.Color(value);
    });



    function onDocumentMouse(event) {
        event.preventDefault();
        df_Mouse.x = ((event.clientX - df_canvas.getBoundingClientRect().left) / df_canvas.offsetWidth) * 2 - 1;
        df_Mouse.y = -((event.clientY - df_canvas.getBoundingClientRect().top) / df_canvas.offsetHeight) * 2 + 1;
        df_Raycaster.setFromCamera(df_Mouse, camera);
        return {
            mouse: df_Mouse,
            event: event,
            raycaster: df_Raycaster
        }
    }
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        composer.setSize(window.innerWidth, window.innerHeight);
    }
    function onDocumentMouseUp(event) {
        if (typeof opt.mouseUp === 'function') {
            opt.mouseUp(onDocumentMouse(event))
        }
    }
    function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        // renderer.render(scene, camera);
        if (opt.animation) opt.animation(delta);
        if (stats) stats.update();
        composer.render();
    }
    init();
    animate();
}