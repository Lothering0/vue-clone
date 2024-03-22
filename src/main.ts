import {
  computed,
  defineComponent,
  h,
  onBeforeMount,
  onBeforeUpdate,
  onMounted,
  onUpdated,
  reactive,
  ref,
  watch,
  watchEffect,
} from "./framework";

const component = defineComponent(() => {
  const a = ref(4);
  const obj = reactive({ b: 3 });

  const sum = computed(() => a.value + obj.b);

  onBeforeMount(() => {
    console.log("Before mount");
  });

  onMounted(() => {
    console.log("Mounted");
  });

  onBeforeUpdate(() => {
    console.log("Before update");
  });

  onUpdated(() => {
    console.log(sum.value);
  });

  watch(a, () => {
    console.log("a watcher:", a.value);
  });

  watchEffect(() => {
    console.log("obj.b watcher:", obj.b);
  });

  return h("div", [
    h("span", () => `${sum.value}`),
    h("br"),
    h("button", { onclick: () => a.value++, style: "margin-right: 5px" }, () => "Increase a"),
    h("button", { onclick: () => obj.b++ }, () => "Increase obj.b"),
  ]);
});

component.mount("body");
