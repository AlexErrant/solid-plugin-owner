/* @refresh reload */
import {
  type Component,
  type VoidComponent,
  createSignal,
  createResource,
} from "solid-js";
import { render, Dynamic } from "solid-js/web";

type PluginType = {
  Plugin: VoidComponent<{
    count: number;
    child: VoidComponent<{ count: number }>;
  }>;
};

const pluginCode = `
import { getOwner, render, insert, template } from "solid-js/web";

export const Plugin = (props) => {
  console.log("Plugin owner", getOwner())
  const renderMount = document.createElement("div");
  render(() => {
    const d = template("<div>")();
    insert(d, "plugin count is ", null);
    insert(d, () => props.count, null);
    insert(d, props.child({
      get count() {
        return props.count;
      },
    }), null);
    return d;
  }, renderMount);
  return renderMount;
};
`;

// https://stackoverflow.com/a/57255653
async function loadPlugin() {
  const blob = new Blob([pluginCode], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const module = await import(/* @vite-ignore */ url);
  URL.revokeObjectURL(url); // GC objectURLs
  return (module as PluginType).Plugin;
}

const ChildComp: VoidComponent<{ count: number }> = (props) => {
  return <div>Child Comp, *2 prop is {props.count * 2}</div>;
};

const App: Component = () => {
  const [count, setCount] = createSignal(0);
  const [plugin] = createResource(loadPlugin);
  return (
    <div>
      <button onClick={() => setCount((x) => x + 1)}>
        Increment {count()}
      </button>
      <Dynamic component={plugin()} count={count()} child={ChildComp} />
    </div>
  );
};

render(() => <App />, document.getElementById("app")!);
