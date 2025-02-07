import {findUpperTransform, nodeIsInBoundingObject} from './utils/utils.js';
import WbWorld from './WbWorld.js';

export default class WbBaseNode {
  #boundingObjectFirstTimeSearch;
  #isInBoundingObject;
  #upperTransformFirstTimeSearch;
  constructor(id) {
    this.id = id;

    this.wrenObjectsCreatedCalled = false;
    this.isPreFinalizeCalled = false;
    this.isPostFinalizeCalled = false;

    this.#upperTransformFirstTimeSearch = true;
    this.upperTransform = false;

    this.#boundingObjectFirstTimeSearch = true;
    this.#isInBoundingObject = false;

    this.useList = [];
  }

  createWrenObjects() {
    if (this.wrenObjectsCreatedCalled)
      return;

    this.wrenObjectsCreatedCalled = true;

    if (typeof this.parent !== 'undefined')
      this.wrenNode = WbWorld.instance.nodes.get(this.parent).wrenNode;
    else
      this.wrenNode = _wr_scene_get_root(_wr_scene_get_instance());
  }

  delete() {
    if (this.useList.length !== 0) {
      let newDef;
      let index = 0;
      while (typeof newDef === 'undefined' && index < this.useList.length) {
        newDef = WbWorld.instance.nodes.get(this.useList[index]);
        this.useList.splice(index, 1);
        index++;
      }

      if (typeof newDef !== 'undefined')
        newDef.useList = this.useList;
    }

    WbWorld.instance.nodes.delete(this.id);
  }

  finalize() {
    if (!this.isPreFinalizeCalled)
      this.preFinalize();

    if (!this.wrenObjectsCreatedCalled)
      this.createWrenObjects();

    if (!this.isPostFinalizeCalled)
      this.postFinalize();
  }

  isInBoundingObject() {
    if (this.#boundingObjectFirstTimeSearch) {
      this.#isInBoundingObject = nodeIsInBoundingObject(this);
      if (this.wrenObjectsCreatedCalled)
        this.#boundingObjectFirstTimeSearch = false;
    }

    return this.#isInBoundingObject;
  }

  upperTransform() {
    if (this.#upperTransformFirstTimeSearch) {
      this.upperTransform = findUpperTransform(this);
      if (this.wrenObjectsCreatedCalled)
        this.#upperTransformFirstTimeSearch = false;
    }

    return this.upperTransform;
  }

  preFinalize() {
    this.isPreFinalizeCalled = true;
  }

  postFinalize() {
    this.isPostFinalizeCalled = true;
  }
}
