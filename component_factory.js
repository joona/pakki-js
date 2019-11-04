const componentFactory = {
  _factories: {},

  register(componentName, factory) {
    componentFactory._factories[componentName] = factory;
    return this;
  },

  attachComponents() {
    const components = document.body.querySelectorAll('.component');

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
