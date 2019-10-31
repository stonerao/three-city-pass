function initCity(scene) {
    var material = null;
    function getCity() {
        var uniform = {
            u_color: { value: new THREE.Color("#5588aa") },
            u_tcolor: { value: new THREE.Color("#ff9800") },
            u_r: { value: 0.25 },
            u_length: { value: 20 },//扫过区域
            u_max: { value: 300 }//扫过最大值
        };
        var Shader = {
            vertexShader: ` 
                varying vec3 vp;
                void main(){
                vp = position; 
                gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vp;
                uniform vec3 u_color;
                uniform vec3 u_tcolor;
                uniform float u_r;
                uniform float u_length;
                uniform float u_max;
                float getLeng(float x, float y){
                    return  sqrt((x-0.0)*(x-0.0)+(y-0.0)*(y-0.0));
                }
                void main(){ 
                    float uOpacity = 0.3; 
                    vec3 vColor = u_color;
                    float uLength = getLeng(vp.x,vp.z);
                    if ( uLength <= u_r && uLength > u_r - u_length ) { 
                        float op = sin( (u_r - uLength) / u_length ) * 0.6 + 0.3 ;
                        uOpacity = op; 
                        if( vp.y<0.0){
                            vColor  = u_tcolor * 0.6; 
                        }else{ 
                            vColor = u_tcolor;
                        };
                    } 
                    gl_FragColor = vec4(vColor,uOpacity);
                }
            `
        }

        material = new THREE.ShaderMaterial({
            vertexShader: Shader.vertexShader,
            fragmentShader: Shader.fragmentShader,
            side: THREE.DoubleSide,
            uniforms: uniform,
            transparent: true,
            depthWrite: false,
        });
        var loaderobj = new THREE.OBJLoader()
        loaderobj.load('../assets/city-gry1.obj', function (object) {
            object.children.forEach(element => {
                element.material = material
            });
            let size = 0.3;
            object.scale.set(size, size, size)
            scene.add(object);
        });

    }
    this.animation = function (dalte) {
        if (material) {
            material.uniforms.u_r.value += dalte * 50;
            if (material.uniforms.u_r.value >= 300) {
                material.uniforms.u_r.value = 20
            }
        }
    }
    function load() {
        getCity()
    }
    load()
}