export const COMPONENTS = ["ServerProxy", 'ApiProxy'];

const COMPONENT_NAME = {
  ServerProxy: "本地代理",
  ApiProxy: "协议代理"
}

export const COMPONENTS_INFO = COMPONENTS.map(component => {
  return {
    component,
    name: COMPONENT_NAME[component]
  }
});