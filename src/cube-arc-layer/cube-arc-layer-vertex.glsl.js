// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default `\
#define SHADER_NAME cube-arc-layer-vertex-shader

attribute vec3 positions;
attribute vec2 texCoords;

attribute vec4 instanceArcPositions;

uniform mat4 uSMatrix;
uniform float currentTime;

varying vec2 vTextureCoord;

float paraboloid(vec2 source, vec2 target, float ratio) {
  vec2 x = mix(source, target, ratio);
  vec2 center = mix(source, target, 0.5);

  float dSourceCenter = distance(source, center);
  float dXCenter = distance(x, center);

  return (dSourceCenter + dXCenter) * (dSourceCenter - dXCenter);
}

vec3 getPos(vec2 source, vec2 target, float segmentRatio) {
  float vertex_height = paraboloid(source, target, segmentRatio);

  return vec3(
    mix(source, target, segmentRatio),
    sqrt(max(0.0, vertex_height))
  );
}

void main(void) {
	vec2 source = project_position(instanceArcPositions.xy);
  vec2 target = project_position(instanceArcPositions.zw);

  float vAlpha = currentTime / 10.0;

	vec3 currPos = getPos(source, target, vAlpha);
	vec3 midPos = vec3(mix(source, target, 0.5), 0);
	vec3 nextPos = getPos(source, target, vAlpha + 0.01);

  vec4 curr = project_to_clipspace(vec4(currPos, 1.0));
  vec4 mid = project_to_clipspace(vec4(midPos, 1.0));
	vec4 next = project_to_clipspace(vec4(nextPos, 1.0));

	mat4 translationMatrix = mat4(
		vec4(1.0, 0, 0, 0),
		vec4(0, 1.0, 0, 0),
		vec4(0, 0, 1.0, 0),
		curr
	);

  // https://stackoverflow.com/questions/26017467/rotate-object-to-look-at-another-object-in-3-dimensions
  vec3 upVector = curr.xyz - mid.xyz;
  vec3 orientZ = normalize(next.xyz - curr.xyz);
  vec3 orientX = normalize(cross(upVector, orientZ));
  vec3 orientY = cross(orientZ, orientX);

  mat4 orientationMatrix = mat4(
    vec4(orientX, 0),
    vec4(orientY, 0),
    vec4(orientZ, 0),
    vec4(0, 0, 0, 1.0)
  );

	gl_Position = translationMatrix * orientationMatrix * uSMatrix * vec4(positions, 1.0);
  vTextureCoord = texCoords;
}
`;
