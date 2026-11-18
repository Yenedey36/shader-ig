// Author: Yenedey Morán Delgado

#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution,u_mouse;
uniform float u_time;
void main(){
vec2 R=u_resolution,st=gl_FragCoord.xy/R.y,m=u_mouse/R.y;
float d=distance(st,m),w=sin(d*10.-u_time*3.),p=smoothstep(.7,0.,d);
vec2 f=fract((st+(st-m)/(d+.2)*.08)*9.)-.5;
float s=smoothstep(.06,.02,abs(length(f)-.22-.1*w));
vec3 c=mix(vec3(.05,.07,.12),mix(vec3(.15,.65,.85),vec3(.95,.8,.55),p),s);
gl_FragColor=vec4(c+p*.12,1.);
}