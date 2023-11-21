import { DomUtil } from '../assets/doms/DomUtils'
const Cesium = window.Cesium;

class StatusBar {
  /**
   * 状态栏工具类
   * @param {Viewer} viewer - 三维场景
   */
  constructor(viewer) {
    if (!viewer) throw new Error('viewer is required!')
    this._viewer = viewer
    this._show = false //初始化显示状态
    this._handler
    this._posX
    this._posY
    this._cameraHeight
    this._pitch
    this._heading
    this._scale
    this.initListener()
  }
  /**
   * 状态栏参数
   * @readonly
   */
  get params() {
    return {
      posX: this._posX,
      posY: this._posY,
      cameraHeight: this._cameraHeight,
      pitch: this._pitch,
      heading: this._heading,
      scale: this._scale
    }
  }
  get statusDom() {
    let innerHtml = `<span class="status-all">状态：正常</span>
    <span class="status-position">
      <span>经度：${this._posX}</span>
      <span>纬度：${this._posY}</span>
      <span>相机高度：${this._cameraHeight}</span>
      <span>方向：${this._pitch}</span>
      <span>俯仰角：${this._heading}</span>
    </span>
    <span class="status-scale">
      比例尺：
      <span class="scale-border">
      ${this._scale}
      </span>
    </span>`
    return innerHtml
  }
  /**
   * 控制显示Boolean常量
   * @constant
   */
  get show() {
    return this._show
  }
  set show(bool) {
    bool ? this.createStatusBar() : this.removeStatusBar()
    this._show = bool
  }
  initListener() {
    const $this = this
    const scene = this._viewer.scene
    this._scaleListener = function () {
      let width = scene.canvas.clientWidth
      let height = scene.canvas.clientHeight
      let left = scene.camera.getPickRay(
        new Cesium.Cartesian2((width / 2) | 0, height - 1)
      )
      let right = scene.camera.getPickRay(
        new Cesium.Cartesian2((1 + width / 2) | 0, height - 1)
      )
      let globe = scene.globe
      let leftPosition = globe.pick(left, scene)
      let rightPosition = globe.pick(right, scene)
      if (leftPosition && rightPosition) {
        let geodesic = new Cesium.EllipsoidGeodesic()
        let leftCartographic = globe.ellipsoid.cartesianToCartographic(
          leftPosition
        )
        let rightCartographic = globe.ellipsoid.cartesianToCartographic(
          rightPosition
        )
        geodesic.setEndPoints(leftCartographic, rightCartographic)
        let distance = geodesic.surfaceDistance
        let curScaleNum = $this.closest(distance / 10)
        if (curScaleNum < 1) {
          $this._scale = curScaleNum * 1000 + 'm'
        } else {
          $this._scale = curScaleNum + 'km'
        }
      }
    }
  }
  createStatusBar() {
    const _delegate = this._viewer
    this.initHandler(_delegate)
    this.initScale(_delegate, true)
    this._domContainer = DomUtil.create(
      'div',
      'lk-status-bar',
      document.getElementById(this._viewer._container.id)
    )
  }
  removeStatusBar() {
    this.initScale(this._viewer, false)
    this._handler.destroy()
    DomUtil.remove(this._domContainer)
  }
  initHandler(viewer) {
    const $this = this
    this._handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    const mouseOverHandler = function (movement) {
      let endPosition = movement.endPosition
      const cartesian = viewer.scene.camera.pickEllipsoid(
        endPosition,
        viewer.scene.globe.ellipsoid
      )
      if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
        $this._posX = Cesium.Math.toDegrees(cartographic.longitude).toFixed(5)
        $this._posY = Cesium.Math.toDegrees(cartographic.latitude).toFixed(5)
        const cameraH = viewer.camera.positionCartographic.height
        $this._cameraHeight =
          cameraH < 1000
            ? cameraH.toFixed(2) + 'm'
            : (cameraH / 1000).toFixed(2) + 'km'
        $this._pitch = Number(viewer.scene.camera.pitch).toFixed(2)
        $this._heading = Number(viewer.scene.camera.heading).toFixed(2)
        $this._domContainer.innerHTML = $this.statusDom
      }
    }
    this._handler.setInputAction(
      mouseOverHandler,
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    )
  }
  initScale(viewer, bool) {
    const scene = viewer.scene
    bool
      ? scene.postRender.addEventListener(this._scaleListener)
      : scene.postRender.removeEventListener(this._scaleListener)
  }
  closest(num) {
    const scaleList = [
      0.001,
      0.002,
      0.003,
      0.005,
      0.01,
      0.015,
      0.02,
      0.025,
      0.03,
      0.035,
      0.04,
      0.045,
      0.05,
      0.06,
      0.07,
      0.08,
      0.09,
      0.1,
      0.12,
      0.15,
      0.2,
      0.25,
      0.3,
      0.5,
      1,
      2,
      3,
      5,
      10,
      15,
      20,
      25,
      30,
      35,
      40,
      45,
      50,
      60,
      70,
      80,
      90,
      100,
      120,
      150,
      200,
      250,
      300,
      500,
      1000,
      2000,
      5000,
      10000,
      100000,
      500000,
      1000000
    ]
    let ret = scaleList[0]
    let distance = Math.abs(ret - num)
    for (let i = 1; i < scaleList.length; i++) {
      let newDistance = Math.abs(scaleList[i] - num)
      if (newDistance < distance) {
        distance = newDistance
        ret = scaleList[i]
      }
    }
    return ret
  }
}
export default StatusBar