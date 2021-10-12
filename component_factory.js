const componentFactory = {
  _factories: {},
  selector: '.component',

  register(componentName, factory) {
    componentFactory._factories[componentName] = factory;
    return this;
  },

  attachComponents(selector) {
    const components = document.body.querySelectorAll(selector || componentFactory.selector);

    for (var i = 0, len = components.length; i < len; i++) {
      const element = components[i];
      componentFactory.attachComponent(element);
    }
  },

  attachComponent(element, options = {}) {
    let component, shouldInit = true;

    if(options.noInit) {
      shouldInit = false;
    }

    const componentName = element.getAttribute('data-component');
    if(!componentName) return;

    const factory = componentFactory._factories[componentName];
    if(!factory) {
      console.log('unknown component:', componentName);
      return;
    }

    component = factory(element);

    if(component && component.init && !component.noInit && shouldInit) {
      component.init();
    }

    return component;
  }
};

export default componentFactory;
