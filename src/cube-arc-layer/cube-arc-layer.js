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

import {Layer} from 'deck.gl';
import {Geometry, GL, loadTextures, Model} from 'luma.gl';
import {Matrix4} from 'math.gl';

import vs from './cube-arc-layer-vertex.glsl';
import fs from './cube-arc-layer-fragment.glsl';

const defaultProps = {
  getSourcePosition: x => x.sourcePosition,
  getTargetPosition: x => x.targetPosition,
	currentTime: 0,
};

export default class CubeArcLayer extends Layer {
  constructor(props) {
    super(props);
  }

  getShaders() {
    return {
			vs,
			fs,
		};
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    const {gl} = this.context;

    attributeManager.addInstanced({
      instanceArcPositions: {
        size: 4,
        accessors: ['getSourcePosition', 'getTargetPosition'],
        update: this.calculateArcPositions,
      },
    });

		this.setState({
			model: this._getModel(gl),
		});

		loadTextures(gl, {
			urls: [this.props.texture]
		}).then(textures => {
			this.state.model.setUniforms({
				uTexture: textures[0],
			})
		});
  }

  updateAttribute({props, oldProps, changeFlags}) {
    const attributeManager = this.getAttributeManager();
    attributeManager.invalidateAll();
  }

  updateState({props, oldProps, changeFlags}) {
		super.updateState({props, oldProps, changeFlags});

		this.updateAttribute({props, oldProps, changeFlags});

		console.log(props.currentTime);

    this.state.model.setUniforms({
      currentTime: props.currentTime
    });
  }

  calculateArcPositions(attribute) {
    const {data, getSourcePosition, getTargetPosition} = this.props
    const {size, value} = attribute

    let index = 0
    for (let i = 0; i < data.length; i++) {
      const arc = data[i]
      const sourcePosition = getSourcePosition(arc);
      const targetPosition = getTargetPosition(arc);

      value[index] = sourcePosition[0]
      value[index + 1] = sourcePosition[1]
      value[index + 2] = targetPosition[0]
      value[index + 3] = targetPosition[1]
      index += size
    }
  }

  _getModel(gl) {
		// cube geometry reference
    // https://github.com/uber/luma.gl/blob/master/src/geometry/cube-geometry.js

		let positions = [
      // Front
      -1, -1,  1,
       1, -1,  1,
       1,  1,  1,
      -1,  1,  1,

      // Back
      -1, -1, -1,
      -1,  1, -1,
       1,  1, -1,
       1, -1, -1,

       // Top
      -1,  1, -1,
      -1,  1,  1,
       1,  1,  1,
       1,  1, -1,

       // Bottom
      -1, -1, -1,
       1, -1, -1,
       1, -1,  1,
      -1, -1,  1,

      // Right
       1, -1, -1,
       1,  1, -1,
       1,  1,  1,
       1, -1,  1,

       // Left
      -1, -1, -1,
      -1, -1,  1,
      -1,  1,  1,
      -1,  1, -1,
    ];

    let texCoords = [
      // Front face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,

      // Back face
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,

      // Top face
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,

      // Bottom face
      1.0, 1.0,
      0.0, 1.0,
      0.0, 0.0,
      1.0, 0.0,

      // Right face
      0.0, 0.0,
      0.0, 1.0,
      1.0, 1.0,
      1.0, 0.0,

      // Left face
      0.0, 0.0,
      1.0, 0.0,
      1.0, 1.0,
      0.0, 1.0,
    ];

    let indices = [
      0, 1, 2, 0, 2, 3,
      4, 5, 6, 4, 6, 7,
      8, 9, 10, 8, 10, 11,
      12, 13, 14, 12, 14, 15,
      16, 17, 18, 16, 18, 19,
      20, 21, 22, 20, 22, 23,
    ];

		const model = new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES, // TRIANGLE_STRIP looks glitchy
					attributes: {
						positions: new Float32Array(positions),
						texCoords: new Float32Array(texCoords),
						indices: new Uint16Array(indices),
          }
      	}),
      	isInstanced: true,
      	shaderCache: this.context.shaderCache,
  		})
		);

    const scaleMatrix = new Matrix4().scale([
      this.props.scaleTextureX,
      this.props.scaleTextureY,
      this.props.scaleTextureZ
    ]);

    model.setUniforms({
      uSMatrix: scaleMatrix,
    });

    return model;
  }
}

CubeArcLayer.layerName = 'CubeArcLayer';
CubeArcLayer.defaultProps = defaultProps;
