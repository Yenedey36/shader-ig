#Author: Yenedey Morán Delgado

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    // Coordenadas normalizadas corrigiendo la relacion de aspecto
    vec2 R = u_resolution;
    vec2 st = gl_FragCoord.xy / R.y;
    vec2 m = u_mouse / R.y;

    // Distancia al cursor, onda temporal y factor de cercania
    float d = distance(st, m);
    float onda = sin(d * 10.0 - u_time * 3.0);
    float cercania = smoothstep(0.7, 0.0, d);

    // Efecto lente magnetica y creacion de la rejilla con fract()
    vec2 desplazamiento = (st - m) / (d + 0.2) * 0.08;
    vec2 celda = fract((st + desplazamiento) * 9.0) - 0.5;

    // Anillo procedimental con radio dinamico y bordes suavizados
    float radio = 0.22 + 0.1 * onda;
    float anillo = smoothstep(0.06, 0.02, abs(length(celda) - radio));

    // Paleta de colores y mezcla final
    vec3 colorFondo = vec3(0.05, 0.07, 0.12);
    vec3 colorLejos = vec3(0.15, 0.65, 0.85);
    vec3 colorCerca = vec3(0.95, 0.80, 0.55);

    vec3 colorForma = mix(colorLejos, colorCerca, cercania);
    vec3 color = mix(colorFondo, colorForma, anillo) + cercania * 0.12;

    gl_FragColor = vec4(color, 1.0);
}