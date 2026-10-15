import { ShaderMaterial, Color } from "three";
/** Abstract terrain shading, not satellite imagery or elevation data. */
export function terrainMaterial() {
  return new ShaderMaterial({
    transparent: true,
    uniforms: {
      opacity: { value: 0 },
      sand: { value: new Color("#b8af91") },
      green: { value: new Color("#6d8370") },
    },
    vertexShader: `varying vec2 vP;void main(){vP=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `
 varying vec2 vP;uniform float opacity;uniform vec3 sand;uniform vec3 green;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float f=0.;f+=.5*noise(p);f+=.25*noise(p*2.03);f+=.125*noise(p*4.1);f+=.0625*noise(p*8.2);return f;}
 void main(){float n=fbm(vP*.55);float detail=fbm(vP*5.);float coast=smoothstep(-2.,9.,vP.x)*.5+smoothstep(1.,-8.,vP.y)*.15;vec3 col=mix(sand,green,clamp(coast+n*.32,0.,1.));col*=.83+n*.3;float contours=pow(1.-abs(sin((n+detail*.08)*85.)),14.);col+=contours*.018;col+=(detail-.45)*.045;gl_FragColor=vec4(col,opacity);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`,
  });
}
