![掠过效果](https://stonerao.github.io/three-city-pass/city.gif)

### 特效

使用Obj 模型 + shader 实线 
加载 obj 格式文件加载到 scene中；
使用 ShaderMaterial 材质

```javascript
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
                float op = sin( (u_r - uLength) / u_length ) ;
                uOpacity = op; 
                if( vp.y<0.0){
                    vColor = u_color * op;
                }else{ 
                    vColor = u_tcolor;
                };
            } 
            gl_FragColor = vec4(vColor,uOpacity);
        }
    `
}
var material = new THREE.ShaderMaterial({
   	vertexShader: Shader.vertexShader,
    fragmentShader: Shader.fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
	     u_color: { value: new THREE.Color("#5588aa") },
	     u_tcolor: { value: new THREE.Color("#f55c1a") },
	     u_r: { value: 0.25 },
	     u_length: { value: 20 },//扫过区域
	     u_max: { value: 300 }//扫过最大值
	},
   	transparent: true,
    depthWrite: false,
});
//rennder 
material.uniforms.u_r.value += dalte * 100;
    if (material.uniforms.u_r.value >= 300) {
       material.uniforms.u_r.value = 20
	}
}
```

