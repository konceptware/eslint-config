import base from '../../src/index.ts'
import react from '../../src/react.ts'

import { describeRules } from './cases.ts'

const config = [...base, ...react]

const HOOKS = 'import { useEffect, useMemo, useRef, useState } from "react"\n\n'

const CONDITIONAL_HOOK = `${HOOKS}export function Toggle({ on }: { on: boolean }) {\n  if (on) useState(0)\n  return <div />\n}\n`
const MISSING_DEP = `${HOOKS}export function Log({ id }: { id: number }) {\n  useEffect(() => {\n    console.info(id)\n  }, [])\n  return <div />\n}\n`
const GLOBAL_WRITE = `${HOOKS}let count = 0\n\nexport function Counter() {\n  count += 1\n  return <div>{count}</div>\n}\n`
const STATE_MUTATION = `${HOOKS}export function Box() {\n  const [s] = useState({ n: 1 })\n  s.n = 2\n  return <div>{s.n}</div>\n}\n`
const IMPURE_CALL = `${HOOKS}export function Dice() {\n  const n = Math.random()\n  return <div>{n}</div>\n}\n`
const REF_READ = `${HOOKS}export function Box() {\n  const r = useRef(0)\n  return <div>{r.current}</div>\n}\n`
const EFFECT_SET_STATE = `${HOOKS}export function Init() {\n  const [n, setN] = useState(0)\n  useEffect(() => {\n    setN(1)\n  }, [])\n  return <div>{n}</div>\n}\n`
const RENDER_SET_STATE = `${HOOKS}export function Loop() {\n  const [n, setN] = useState(0)\n  setN(1)\n  return <div>{n}</div>\n}\n`
const NESTED_COMPONENT = `${HOOKS}export function Outer() {\n  const Inner = () => <div />\n  return <Inner />\n}\n`
const EVAL_RENDER = `${HOOKS}export function Run() {\n  const v = eval("1") as string\n  return <div>{v}</div>\n}\n`
const MEMO_PARAM = `${HOOKS}export function Calc() {\n  const v = useMemo((x: number) => x, [])\n  return <div>{v}</div>\n}\n`
const TRY_RENDER = `${HOOKS}declare function Child(): null\n\nexport function Safe() {\n  try {\n    return <Child />\n  } catch {\n    return null\n  }\n}\n`

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/error-boundaries',
    invalid: [TRY_RENDER],
    valid: [
      `${HOOKS}declare function Child(): null\n\nexport function Safe() {\n  return <Child />\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-forward-ref',
    invalid: [
      'import { forwardRef } from "react"\n\nexport const Field = forwardRef<HTMLInputElement>((_props, ref) => <input ref={ref} />)\n',
    ],
    valid: [
      'import type { Ref } from "react"\n\nexport function Field({ ref }: { ref?: Ref<HTMLInputElement> }) {\n  return <input ref={ref} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/exhaustive-deps',
    invalid: [
      MISSING_DEP,
      `${HOOKS}export function Log({ id }: { id: number }) {\n  useEffect(() => {\n    console.info(id)\n  })\n  return <div />\n}\n`,
    ],
    valid: [
      `${HOOKS}export function Log({ id }: { id: number }) {\n  useEffect(() => {\n    console.info(id)\n  }, [id])\n  return <div />\n}\n`,
      `${HOOKS}export function Log({ id }: { id: number }) {\n  useEffect(() => {\n    console.info(id)\n  }, undefined)\n  return <div />\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/globals',
    invalid: [GLOBAL_WRITE],
    valid: [
      `${HOOKS}export function Counter() {\n  const count = 1\n  return <div>{count}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/immutability',
    invalid: [
      STATE_MUTATION,
      `${HOOKS}export function List({ items }: { items: number[] }) {\n  items.push(1)\n  return <div>{items.length}</div>\n}\n`,
    ],
    valid: [
      `${HOOKS}export function Box() {\n  const [s] = useState({ n: 1 })\n  return <div>{s.n}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/purity',
    invalid: [IMPURE_CALL],
    valid: [
      `${HOOKS}export function Dice() {\n  const [n] = useState(() => Math.random())\n  return <div>{n}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/refs',
    invalid: [REF_READ],
    valid: [
      `${HOOKS}export function Box() {\n  const r = useRef(0)\n  useEffect(() => {\n    r.current = 1\n  }, [])\n  return <div />\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/rules-of-hooks',
    invalid: [CONDITIONAL_HOOK],
    valid: [
      `${HOOKS}export function Toggle() {\n  const [n] = useState(0)\n  return <div>{n}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/set-state-in-effect',
    invalid: [EFFECT_SET_STATE],
    valid: [
      `${HOOKS}export function Init() {\n  const [n] = useState(1)\n  return <div>{n}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/set-state-in-render',
    invalid: [RENDER_SET_STATE],
    valid: [
      `${HOOKS}export function Loop() {\n  const [n, setN] = useState(0)\n  return <input value={n} onChange={() => setN(1)} />\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/static-components',
    invalid: [NESTED_COMPONENT],
    valid: [
      `${HOOKS}function Inner() {\n  return <div />\n}\n\nexport function Outer() {\n  return <Inner />\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/unsupported-syntax',
    invalid: [EVAL_RENDER],
    valid: [`${HOOKS}export function Run() {\n  const v = "1"\n  return <div>{v}</div>\n}\n`],
  },
  {
    rule: '@eslint-react/use-memo',
    invalid: [
      MEMO_PARAM,
      `${HOOKS}export function Calc() {\n  useMemo(() => 1, [])\n  return <div />\n}\n`,
    ],
    valid: [
      `${HOOKS}export function Calc() {\n  const v = useMemo(() => 1, [])\n  return <div>{v}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-context-provider',
    // Only a context named `*Context` is recognised.
    invalid: [
      'import { createContext } from "react"\n\nconst ThemeContext = createContext("light")\n\nexport function App() {\n  return (\n    <ThemeContext.Provider value="dark">\n      <div />\n    </ThemeContext.Provider>\n  )\n}\n',
    ],
    valid: [
      'import { createContext } from "react"\n\nconst ThemeContext = createContext("light")\n\nexport function App() {\n  return (\n    <ThemeContext value="dark">\n      <div />\n    </ThemeContext>\n  )\n}\n',
    ],
  },
  {
    rule: '@eslint-react/dom-no-render',
    invalid: [
      'import ReactDOM from "react-dom"\n\ndeclare const el: HTMLElement\n\nReactDOM.render(<div />, el)\n',
    ],
    valid: [
      'import { createRoot } from "react-dom/client"\n\ndeclare const el: HTMLElement\n\ncreateRoot(el).render(<div />)\n',
    ],
  },
  {
    rule: '@eslint-react/dom-no-hydrate',
    invalid: [
      'import ReactDOM from "react-dom"\n\ndeclare const el: HTMLElement\n\nReactDOM.hydrate(<div />, el)\n',
    ],
    valid: [
      'import { hydrateRoot } from "react-dom/client"\n\ndeclare const el: HTMLElement\n\nhydrateRoot(el, <div />)\n',
    ],
  },
  { rule: 'react-hooks/set-state-in-effect', invalid: [], valid: [EFFECT_SET_STATE] },
  { rule: 'react-hooks/set-state-in-render', invalid: [], valid: [RENDER_SET_STATE] },
  { rule: 'react-hooks/static-components', invalid: [], valid: [NESTED_COMPONENT] },
  { rule: 'react-hooks/unsupported-syntax', invalid: [], valid: [EVAL_RENDER] },
  { rule: 'react-hooks/use-memo', invalid: [], valid: [MEMO_PARAM] },
  // An `x-` alias is the same rule object as its unprefixed name and would report twice.
  {
    rule: '@eslint-react/x-rules-of-hooks',
    invalid: [],
    valid: [CONDITIONAL_HOOK],
  },
  // The @eslint-react versions own these.
  { rule: 'react-hooks/error-boundaries', invalid: [], valid: [TRY_RENDER] },
  { rule: 'react-hooks/exhaustive-deps', invalid: [], valid: [MISSING_DEP] },
  { rule: 'react-hooks/globals', invalid: [], valid: [GLOBAL_WRITE] },
  { rule: 'react-hooks/immutability', invalid: [], valid: [STATE_MUTATION] },
  { rule: 'react-hooks/purity', invalid: [], valid: [IMPURE_CALL] },
  { rule: 'react-hooks/refs', invalid: [], valid: [REF_READ] },
  { rule: 'react-hooks/rules-of-hooks', invalid: [], valid: [CONDITIONAL_HOOK] },
])

// Custom hooks live in `.ts` files with no JSX.
describeRules(config, 'src/lint-text.ts', [
  {
    rule: '@eslint-react/rules-of-hooks',
    invalid: [`${HOOKS}export function useToggle(on: boolean): void {\n  if (on) useState(0)\n}\n`],
    valid: [
      `${HOOKS}export function useToggle(): number {\n  const [n] = useState(0)\n  return n\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/exhaustive-deps',
    invalid: [
      `${HOOKS}export function useLog(id: number): void {\n  useEffect(() => {\n    console.info(id)\n  }, [])\n}\n`,
    ],
    valid: [
      `${HOOKS}export function useLog(id: number): void {\n  useEffect(() => {\n    console.info(id)\n  }, [id])\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/set-state-in-effect',
    invalid: [
      `${HOOKS}export function useInit(): number {\n  const [n, setN] = useState(0)\n  useEffect(() => {\n    setN(1)\n  }, [])\n  return n\n}\n`,
    ],
    valid: [
      `${HOOKS}export function useInit(): number {\n  const [n] = useState(1)\n  return n\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-use-context',
    invalid: [
      'import { createContext, useContext } from "react"\n\nconst Theme = createContext("light")\n\nexport function useTheme(): string {\n  return useContext(Theme)\n}\n',
    ],
    valid: [
      'import { createContext, use } from "react"\n\nconst Theme = createContext("light")\n\nexport function useTheme(): string {\n  return use(Theme)\n}\n',
    ],
  },
  {
    rule: '@eslint-react/dom-no-use-form-state',
    invalid: [
      'import { useFormState } from "react-dom"\n\nexport function useCounter(): unknown {\n  return useFormState((n: number) => n + 1, 0)\n}\n',
    ],
    valid: [
      'import { useActionState } from "react"\n\nexport function useCounter(): unknown {\n  return useActionState((n: number) => n + 1, 0)\n}\n',
    ],
  },
])

/** `members` inside a class component that renders `<div />`. */
function component(members: string): string {
  return `import { Component } from "react"\n\nexport class Panel extends Component<object, { n: number }> {\n${members}\n\n  render() {\n    return <div />\n  }\n}\n`
}

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/no-class-component',
    invalid: [component('  state = { n: 0 }')],
    // An error boundary can only be written as a class.
    valid: [component('  static getDerivedStateFromError() {\n    return { n: 1 }\n  }')],
  },
  {
    rule: '@eslint-react/no-component-will-mount',
    invalid: [component('  componentWillMount() {\n    console.info("x")\n  }')],
    valid: [component('  componentDidMount() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/no-component-will-receive-props',
    invalid: [component('  componentWillReceiveProps() {\n    console.info("x")\n  }')],
    valid: [component('  componentDidUpdate() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/no-component-will-update',
    invalid: [component('  componentWillUpdate() {\n    console.info("x")\n  }')],
    valid: [component('  componentDidUpdate() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/no-unsafe-component-will-mount',
    invalid: [component('  UNSAFE_componentWillMount() {\n    console.info("x")\n  }')],
    valid: [component('  componentDidMount() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/no-unsafe-component-will-receive-props',
    invalid: [component('  UNSAFE_componentWillReceiveProps() {\n    console.info("x")\n  }')],
    valid: [component('  componentDidUpdate() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/no-unsafe-component-will-update',
    invalid: [component('  UNSAFE_componentWillUpdate() {\n    console.info("x")\n  }')],
    valid: [component('  componentDidUpdate() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/no-access-state-in-setstate',
    invalid: [
      component(
        '  state = { n: 0 }\n\n  bump() {\n    this.setState({ n: this.state.n + 1 })\n  }',
      ),
    ],
    valid: [
      component(
        '  state = { n: 0 }\n\n  bump() {\n    this.setState((s) => ({ n: s.n + 1 }))\n  }',
      ),
    ],
  },
  {
    rule: '@eslint-react/no-direct-mutation-state',
    invalid: [component('  state = { n: 0 }\n\n  bump() {\n    this.state.n = 1\n  }')],
    valid: [
      component('  constructor(props: object) {\n    super(props)\n    this.state = { n: 0 }\n  }'),
    ],
  },
  {
    rule: '@eslint-react/no-set-state-in-component-did-mount',
    invalid: [component('  componentDidMount() {\n    this.setState({ n: 1 })\n  }')],
    valid: [
      component(
        '  componentDidMount() {\n    setTimeout(() => {\n      this.setState({ n: 1 })\n    })\n  }',
      ),
    ],
  },
  {
    rule: '@eslint-react/no-set-state-in-component-did-update',
    invalid: [component('  componentDidUpdate() {\n    this.setState({ n: 1 })\n  }')],
    valid: [
      component(
        '  componentDidUpdate() {\n    setTimeout(() => {\n      this.setState({ n: 1 })\n    })\n  }',
      ),
    ],
  },
  {
    rule: '@eslint-react/no-set-state-in-component-will-update',
    invalid: [component('  componentWillUpdate() {\n    this.setState({ n: 1 })\n  }')],
    valid: [
      component(
        '  componentWillUpdate() {\n    setTimeout(() => {\n      this.setState({ n: 1 })\n    })\n  }',
      ),
    ],
  },
  {
    rule: '@eslint-react/no-unused-class-component-members',
    // Public methods of an exported class are skipped: other modules may call them.
    invalid: [component('  private helper() {\n    return 1\n  }')],
    valid: [component('  componentDidMount() {\n    console.info("x")\n  }')],
  },
  {
    rule: '@eslint-react/dom-no-find-dom-node',
    invalid: [
      'import { findDOMNode } from "react-dom"\n\ndeclare const panel: never\n\nexport const node = findDOMNode(panel)\n',
    ],
    valid: ['export const node = document.body\n'],
  },
  {
    rule: '@eslint-react/dom-no-render-return-value',
    invalid: [
      'import ReactDOM from "react-dom"\n\ndeclare const el: HTMLElement\n\nexport const root = ReactDOM.render(<div />, el)\n',
    ],
    valid: [
      'import ReactDOM from "react-dom"\n\ndeclare const el: HTMLElement\n\nReactDOM.render(<div />, el)\n',
    ],
  },
  {
    rule: '@eslint-react/no-create-ref',
    invalid: [
      `${HOOKS.replace('useRef', 'createRef, useRef')}export function Box() {\n  const r = createRef<HTMLDivElement>()\n  return <div ref={r} />\n}\n`,
    ],
    valid: [
      `${HOOKS}export function Box() {\n  const r = useRef<HTMLDivElement>(null)\n  return <div ref={r} />\n}\n`,
    ],
  },
])

describeRules(config, 'src/lint-text.ts', [
  {
    rule: '@eslint-react/no-create-ref',
    invalid: [
      'import { createRef } from "react"\n\nexport function useBox(): unknown {\n  return createRef<HTMLDivElement>()\n}\n',
    ],
    valid: [
      'import { useRef } from "react"\n\nexport function useBox(): unknown {\n  return useRef<HTMLDivElement>(null)\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-unused-state',
    invalid: [
      `${HOOKS}export function useTick(): () => void {\n  const [n, setN] = useState(0)\n  return () => {\n    setN(1)\n  }\n}\n`,
    ],
    valid: [
      `${HOOKS}export function useTick(): number {\n  const [n] = useState(0)\n  return n\n}\n`,
    ],
  },
])

const CHILDREN = 'import { Children } from "react"\nimport type { ReactNode } from "react"\n\n'

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/no-missing-key',
    invalid: [
      'export function List({ items }: { items: string[] }) {\n  return <ul>{items.map((item) => <li>{item}</li>)}</ul>\n}\n',
      'export function List({ items }: { items: string[] }) {\n  return <dl>{items.map((item) => <><dt>{item}</dt><dd>{item}</dd></>)}</dl>\n}\n',
    ],
    valid: [
      'export function List({ items }: { items: string[] }) {\n  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-duplicate-key',
    invalid: ['export function Pair() {\n  return [<li key="a" />, <li key="a" />]\n}\n'],
    valid: ['export function Pair() {\n  return [<li key="a" />, <li key="b" />]\n}\n'],
  },
  {
    rule: '@eslint-react/no-array-index-key',
    invalid: [
      'export function List({ items }: { items: string[] }) {\n  return <ul>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>\n}\n',
      // eslint-disable-next-line no-template-curly-in-string -- the snippet's template literal key is the code under test
      'export function List({ items }: { items: string[] }) {\n  return <ul>{items.map((item, i) => <li key={`row-${i}`}>{item}</li>)}</ul>\n}\n',
    ],
    valid: [
      'export function List({ items }: { items: string[] }) {\n  return <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-implicit-key',
    // A domain field named `key` becomes React's key when spread; one typed as React's `Key` is deliberate.
    invalid: [
      'declare function Row(props: { label: string }): null\n\nexport function Table({ row }: { row: { key: string; label: string } }) {\n  return <Row {...row} />\n}\n',
    ],
    valid: [
      'import type { Key } from "react"\n\ndeclare function Row(props: { label: string }): null\n\nexport function Table({ row }: { row: { key: Key; label: string } }) {\n  return <Row {...row} />\n}\n',
      'declare function Row(props: { label: string }): null\n\nexport function Table({ row }: { row: { key: string; label: string } }) {\n  return <Row key={row.key} label={row.label} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/jsx-no-key-after-spread',
    invalid: [
      'export function Item(props: { id: string }) {\n  return <li {...props} key={props.id} />\n}\n',
    ],
    valid: [
      'export function Item(props: { id: string }) {\n  return <li key={props.id} {...props} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-children-map',
    invalid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  return <div>{Children.map(children, (c) => c)}</div>\n}\n`,
    ],
    valid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  return <div>{children}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-children-for-each',
    invalid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  Children.forEach(children, (c) => {\n    console.info(c)\n  })\n  return <div />\n}\n`,
    ],
    valid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  return <div>{children}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-children-count',
    invalid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  return <div>{Children.count(children)}</div>\n}\n`,
    ],
    valid: [
      `${CHILDREN}export function Tabs({ count }: { count: number }) {\n  return <div>{count}</div>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-children-only',
    invalid: [
      `${CHILDREN}export function Slot({ children }: { children: ReactNode }) {\n  return Children.only(children)\n}\n`,
    ],
    valid: [
      `${CHILDREN}export function Slot({ children }: { children: ReactNode }) {\n  return <>{children}</>\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-children-to-array',
    invalid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  return <div>{Children.toArray(children).reverse()}</div>\n}\n`,
    ],
    valid: [
      `${CHILDREN}export function Tabs({ children }: { children: ReactNode }) {\n  return <div>{children}</div>\n}\n`,
    ],
  },
])

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/no-clone-element',
    invalid: [
      'import { cloneElement } from "react"\nimport type { ReactNode } from "react"\n\nexport function Tag({ child }: { child: ReactNode }) {\n  return <div>{cloneElement(<span />, { title: "x" })}{child}</div>\n}\n',
    ],
    valid: ['export function Tag() {\n  return <div><span title="x" /></div>\n}\n'],
  },
  {
    rule: '@eslint-react/no-implicit-children',
    invalid: [
      'declare function Card(props: { title: string }): null\n\nexport function List({ item }: { item: { children: string[]; title: string } }) {\n  return <Card {...item} />\n}\n',
    ],
    valid: [
      'import type { ReactNode } from "react"\n\ndeclare function Card(props: { title: string; children: ReactNode }): null\n\nexport function List({ item }: { item: { children: ReactNode; title: string } }) {\n  return <Card {...item} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-implicit-ref',
    invalid: [
      'declare function Field(props: { name: string }): null\n\nexport function Form({ field }: { field: { ref: string; name: string } }) {\n  return <Field {...field} />\n}\n',
    ],
    valid: [
      'import type { ComponentProps } from "react"\n\nexport function Field(props: ComponentProps<"input">) {\n  return <input {...props} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/jsx-no-children-prop',
    invalid: [
      'declare function Card(props: { children: string }): null\n\nexport function A() {\n  return <Card children="x" />\n}\n',
    ],
    valid: [
      'declare function Card(props: { children: string }): null\n\nexport function A() {\n  return <Card>x</Card>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/jsx-no-children-prop-with-children',
    invalid: [
      'declare function Card(props: { children: string }): null\n\nexport function A() {\n  return <Card children="x">y</Card>\n}\n',
    ],
    valid: [
      'declare function Card(props: { children: string }): null\n\nexport function A() {\n  return <Card>y</Card>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/jsx-no-comment-textnodes',
    invalid: ['export function A() {\n  return <div>// note</div>\n}\n'],
    valid: ['export function A() {\n  return <div>{/* note */}</div>\n}\n'],
  },
  {
    rule: '@eslint-react/jsx-no-leaked-dollar',
    invalid: [
      // eslint-disable-next-line no-template-curly-in-string -- the leaked `${` in the snippet is the code under test
      'export function Hi({ name }: { name: string }) {\n  return <p>Hello ${name}</p>\n}\n',
    ],
    valid: [
      'export function Hi({ name }: { name: string }) {\n  return <p>Hello {name}</p>\n}\n',
      // A `$` and one expression as the whole content reads as a price.
      // eslint-disable-next-line no-template-curly-in-string -- the `${` in the snippet is the code under test
      'export function Price({ n }: { n: number }) {\n  return <p>${n}</p>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/jsx-no-leaked-semicolon',
    invalid: [
      'export function A() {\n  return (\n    <div>\n      <span />;\n      text\n    </div>\n  )\n}\n',
    ],
    valid: [
      'export function A() {\n  return (\n    <div>\n      <span />\n      text\n    </div>\n  )\n}\n',
    ],
  },
  // Off in TS files: tsc reports `svg:rect` missing from `JSX.IntrinsicElements`.
  {
    rule: '@eslint-react/jsx-no-namespace',
    invalid: [],
    valid: ['export function A() {\n  return <svg:rect />\n}\n'],
  },
  {
    rule: '@eslint-react/jsx-no-useless-fragment',
    invalid: [
      'export function A() {\n  return <></>\n}\n',
      'import type { ReactNode } from "react"\n\nexport function A({ children }: { children: ReactNode }) {\n  return <>{children}</>\n}\n',
    ],
    valid: [
      'import type { ReactNode } from "react"\n\nexport function A({ children }: { children: ReactNode }) {\n  return children\n}\n',
      'export function A() {\n  return (\n    <>\n      <dt />\n      <dd />\n    </>\n  )\n}\n',
    ],
  },
  {
    rule: '@typescript-eslint/no-restricted-types',
    invalid: [
      'import type { ReactElement } from "react"\n\nexport function slot(): ReactElement {\n  return <div />\n}\n',
      'import type { ReactElement } from "react"\n\nexport function slot(): ReactElement<{ id: string }> | null {\n  return null\n}\n',
      'import type * as React from "react"\n\nexport function slot(): React.ReactElement {\n  return <div />\n}\n',
    ],
    valid: [
      'import type { ReactNode } from "react"\n\nexport function slot(): ReactNode {\n  return <div />\n}\n',
    ],
  },
])

describeRules(config, 'src/lint-jsx.jsx', [
  {
    rule: '@eslint-react/jsx-no-namespace',
    invalid: ['export function A() {\n  return <svg:rect />\n}\n'],
    valid: ['export function A() {\n  return <rect />\n}\n'],
  },
])

describeRules(config, 'src/lint-text.ts', [
  {
    rule: '@typescript-eslint/no-restricted-types',
    invalid: [
      'import type { ReactElement } from "react"\n\nexport type Slot = () => ReactElement\n',
    ],
    valid: ['import type { ReactNode } from "react"\n\nexport type Slot = () => ReactNode\n'],
  },
])

const THEME_CONTEXT =
  'import { createContext, useMemo, useState } from "react"\n\nexport const ThemeContext = createContext<{ theme: string; setTheme: (theme: string) => void } | null>(null)\nThemeContext.displayName = "ThemeContext"\n\n'

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/no-leaked-conditional-rendering',
    invalid: [
      'export function A({ n }: { n: number }) {\n  return <div>{n && <span />}</div>\n}\n',
    ],
    valid: [
      'export function A({ n }: { n: number }) {\n  return <div>{n > 0 && <span />}</div>\n}\n',
      'export function A({ b }: { b: boolean }) {\n  return <div>{b && <span />}</div>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-unused-props',
    invalid: ['export function A({ a }: { a: string; b: string }) {\n  return <div>{a}</div>\n}\n'],
    valid: [
      'export function A({ a, b }: { a: string; b: string }) {\n  return (\n    <div>\n      {a}\n      {b}\n    </div>\n  )\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-unstable-context-value',
    invalid: [
      `${THEME_CONTEXT}export function ThemeProvider() {\n  const [theme, setTheme] = useState("")\n  return <ThemeContext value={{ theme, setTheme }} />\n}\n`,
    ],
    valid: [
      `${THEME_CONTEXT}export function ThemeProvider() {\n  const [theme, setTheme] = useState("")\n  const value = useMemo(() => ({ theme, setTheme }), [theme])\n  return <ThemeContext value={value} />\n}\n`,
    ],
  },
  {
    rule: '@eslint-react/no-unstable-default-props',
    invalid: [
      'export function List({ items = [] }: { items?: string[] }) {\n  return <div>{items.length}</div>\n}\n',
    ],
    valid: [
      'const NONE: string[] = []\n\nexport function List({ items = NONE }: { items?: string[] }) {\n  return <div>{items.length}</div>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-missing-component-display-name',
    invalid: ['import { memo } from "react"\n\nexport const Row = memo(() => <div />)\n'],
    valid: [
      'import { memo } from "react"\n\nfunction RowView() {\n  return <div />\n}\n\nexport const Row = memo(RowView)\n',
    ],
  },
  {
    rule: '@eslint-react/no-nested-component-definitions',
    invalid: [
      NESTED_COMPONENT,
      'declare function List(props: { row: () => unknown }): null\n\nexport function A() {\n  function Row() {\n    return <li />\n  }\n  return <List row={Row} />\n}\n',
    ],
    valid: [
      'declare function List(props: { row: () => unknown }): null\n\nfunction Row() {\n  return <li />\n}\n\nexport function A() {\n  return <List row={Row} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/no-nested-lazy-component-declarations',
    invalid: [
      'import { lazy } from "react"\n\nexport function A() {\n  const X = lazy(async () => import("./x"))\n  return <X />\n}\n',
    ],
    valid: [
      'import { lazy } from "react"\n\nconst X = lazy(async () => import("./x"))\n\nexport function A() {\n  return <X />\n}\n',
    ],
  },
])

describeRules(config, 'src/lint-text.ts', [
  {
    rule: '@eslint-react/no-missing-context-display-name',
    invalid: [
      'import { createContext } from "react"\n\nexport const ThemeContext = createContext("")\n',
    ],
    valid: [
      'import { createContext } from "react"\n\nexport const ThemeContext = createContext("")\nThemeContext.displayName = "ThemeContext"\n',
    ],
  },
  {
    rule: '@eslint-react/no-nested-lazy-component-declarations',
    invalid: [
      'import { lazy, useState } from "react"\n\nexport function useLazy() {\n  const [open, setOpen] = useState(false)\n  return { open, setOpen, View: lazy(async () => import("./x")) }\n}\n',
    ],
    valid: [],
  },
  {
    rule: '@eslint-react/no-unnecessary-use-prefix',
    invalid: ['export function useDouble(n: number) {\n  return n * 2\n}\n'],
    valid: [
      'export function double(n: number) {\n  return n * 2\n}\n',
      'import { useState } from "react"\n\nexport function useFlag() {\n  return useState(false)\n}\n',
    ],
  },
  {
    rule: '@eslint-react/use-state',
    invalid: [
      'import { useState } from "react"\n\nexport function useFlag() {\n  const flag = useState(false)\n  return flag\n}\n',
      'import { useState } from "react"\n\nexport function useFlag() {\n  const [open, toggle] = useState(false)\n  return { open, toggle }\n}\n',
      'import { useState } from "react"\n\ndeclare function compute(): number\n\nexport function useCount() {\n  const [count, setCount] = useState(compute())\n  return { count, setCount }\n}\n',
    ],
    valid: [
      'import { useState } from "react"\n\ndeclare function compute(): number\n\nexport function useCount() {\n  const [count, setCount] = useState(() => compute())\n  return { count, setCount }\n}\n',
    ],
  },
])

describeRules(config, 'src/lint-jsx.jsx', [
  {
    rule: '@eslint-react/no-leaked-conditional-rendering',
    invalid: [],
    valid: ['export function A({ n }) {\n  return <div>{n && <span />}</div>\n}\n'],
  },
  {
    rule: '@eslint-react/no-unused-props',
    invalid: [],
    valid: ['export function A({ a }) {\n  return <div>{a}</div>\n}\n'],
  },
])

describeRules(config, 'src/lint-text.ts', [
  {
    rule: '@eslint-react/no-misused-capture-owner-stack',
    invalid: [
      'import * as React from "react"\n\nexport function stack() {\n  return React.captureOwnerStack()\n}\n',
      'import { captureOwnerStack } from "react"\n\nexport function stack() {\n  if (process.env.NODE_ENV !== "production") {\n    return captureOwnerStack()\n  }\n  return null\n}\n',
    ],
    valid: [
      'import * as React from "react"\n\nexport function stack() {\n  if (process.env.NODE_ENV !== "production") {\n    return React.captureOwnerStack()\n  }\n  return null\n}\n',
    ],
  },
  {
    rule: '@eslint-react/rsc-function-definition',
    invalid: [
      '"use server"\n\nexport function save(n: number) {\n  return n\n}\n',
      'export function f() {\n  "use client"\n  return 1\n}\n',
    ],
    valid: [
      '"use server"\n\nexport async function save(n: number) {\n  return Promise.resolve(n)\n}\n',
    ],
  },
])

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/dom-no-dangerously-set-innerhtml',
    invalid: [
      'export function A({ html }: { html: string }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }} />\n}\n',
    ],
    valid: ['export function A({ text }: { text: string }) {\n  return <div>{text}</div>\n}\n'],
  },
  {
    rule: '@eslint-react/dom-no-dangerously-set-innerhtml-with-children',
    invalid: [
      'export function A({ html }: { html: string }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }}>x</div>\n}\n',
    ],
    valid: [
      'export function A({ html }: { html: string }) {\n  return <div dangerouslySetInnerHTML={{ __html: html }} />\n}\n',
    ],
  },
  {
    rule: '@eslint-react/dom-no-flush-sync',
    invalid: [
      'import { flushSync } from "react-dom"\n\nexport function f(g: () => void) {\n  flushSync(g)\n}\n',
    ],
    valid: [],
  },
  {
    rule: '@eslint-react/dom-no-missing-button-type',
    invalid: ['export function A() {\n  return <button>Go</button>\n}\n'],
    valid: ['export function A() {\n  return <button type="button">Go</button>\n}\n'],
  },
  {
    rule: '@eslint-react/dom-no-missing-iframe-sandbox',
    invalid: ['export function A() {\n  return <iframe src="/x" title="x" />\n}\n'],
    valid: ['export function A() {\n  return <iframe sandbox="" src="/x" title="x" />\n}\n'],
  },
  {
    rule: '@eslint-react/dom-no-unsafe-iframe-sandbox',
    invalid: [
      'export function A() {\n  return <iframe sandbox="allow-scripts allow-same-origin" src="/x" title="x" />\n}\n',
    ],
    valid: [
      'export function A() {\n  return <iframe sandbox="allow-scripts" src="/x" title="x" />\n}\n',
    ],
  },
  // Overlaps core `no-script-url`, which misses the leading-whitespace form browsers still run.
  {
    rule: '@eslint-react/dom-no-script-url',
    invalid: [
      'export function A() {\n  return <a href="javascript:void(0)">x</a>\n}\n',
      'export function A() {\n  return <a href=" javascript:void(0)">x</a>\n}\n',
    ],
    valid: ['export function A() {\n  return <a href="/home">x</a>\n}\n'],
  },
  // Off in TS files: tsc reports a string `style` (TS2559).
  {
    rule: '@eslint-react/dom-no-string-style-prop',
    invalid: [],
    valid: ['export function A() {\n  return <div style="color: red" />\n}\n'],
  },
])

describeRules(config, 'src/lint-jsx.jsx', [
  {
    rule: '@eslint-react/dom-no-string-style-prop',
    invalid: ['export function A() {\n  return <div style="color: red" />\n}\n'],
    valid: ['export function A() {\n  return <div style={{ color: "red" }} />\n}\n'],
  },
])

const EFFECT = 'import { useEffect } from "react"\n\n'

function effect(body: string, cleanup?: string): string {
  const ret = cleanup === undefined ? '' : `\n    return () => {\n      ${cleanup}\n    }`
  return `${EFFECT}export function useWatch(f: () => void, el: Element) {\n  useEffect(() => {\n    ${body}${ret}\n  }, [f, el])\n}\n`
}

describeRules(config, 'src/lint-text.ts', [
  {
    rule: '@eslint-react/web-api-no-leaked-event-listener',
    invalid: [effect('window.addEventListener("resize", f)')],
    valid: [
      effect('window.addEventListener("resize", f)', 'window.removeEventListener("resize", f)'),
    ],
  },
  {
    rule: '@eslint-react/web-api-no-leaked-interval',
    invalid: [effect('setInterval(f, 10)')],
    valid: [effect('const id = setInterval(f, 10)', 'clearInterval(id)')],
  },
  {
    rule: '@eslint-react/web-api-no-leaked-timeout',
    invalid: [effect('setTimeout(f, 10)')],
    valid: [effect('const id = setTimeout(f, 10)', 'clearTimeout(id)')],
  },
  {
    rule: '@eslint-react/web-api-no-leaked-intersection-observer',
    invalid: [effect('new IntersectionObserver(f).observe(el)')],
    valid: [effect('const o = new IntersectionObserver(f)\n    o.observe(el)', 'o.disconnect()')],
  },
  {
    rule: '@eslint-react/web-api-no-leaked-resize-observer',
    invalid: [effect('new ResizeObserver(f).observe(el)')],
    valid: [effect('const o = new ResizeObserver(f)\n    o.observe(el)', 'o.disconnect()')],
  },
  {
    rule: '@eslint-react/web-api-no-leaked-fetch',
    invalid: [effect('void fetch("/x")')],
    valid: [
      effect(
        'const c = new AbortController()\n    void fetch("/x", { signal: c.signal })',
        'c.abort()',
      ),
    ],
  },
  {
    rule: '@eslint-react/naming-convention-context-name',
    invalid: ['import { createContext } from "react"\n\nexport const theme = createContext("")\n'],
    valid: [
      'import { createContext } from "react"\n\nexport const ThemeContext = createContext("")\nThemeContext.displayName = "ThemeContext"\n',
    ],
  },
  {
    rule: '@eslint-react/naming-convention-ref-name',
    invalid: [
      'import { useRef } from "react"\n\nexport function useBox() {\n  const box = useRef(null)\n  return box\n}\n',
    ],
    valid: [
      'import { useRef } from "react"\n\nexport function useBox() {\n  const boxRef = useRef(null)\n  return boxRef\n}\n',
    ],
  },
  {
    rule: '@eslint-react/naming-convention-id-name',
    invalid: [
      'import { useId } from "react"\n\nexport function useField() {\n  const key = useId()\n  return key\n}\n',
    ],
    valid: [
      'import { useId } from "react"\n\nexport function useField() {\n  const fieldId = useId()\n  return fieldId\n}\n',
    ],
  },
])

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: '@eslint-react/dom-no-unsafe-target-blank',
    invalid: [
      'export function A() {\n  return <a href="https://x.com" target="_blank">x</a>\n}\n',
      'export function A() {\n  return <a href="https://x.com" target="_blank" rel="noopener">x</a>\n}\n',
    ],
    valid: [
      'export function A() {\n  return <a href="https://x.com" target="_blank" rel="noreferrer noopener">x</a>\n}\n',
      'export function A() {\n  return <a href="/local" target="_blank">x</a>\n}\n',
    ],
  },
  {
    rule: '@eslint-react/dom-no-void-elements-with-children',
    invalid: ['export function A() {\n  return <br>x</br>\n}\n'],
    valid: ['export function A() {\n  return <br />\n}\n'],
  },
  // Off in TS files: tsc reports unknown props (TS2322).
  {
    rule: '@eslint-react/dom-no-unknown-property',
    invalid: [],
    valid: ['export function A() {\n  return <div class="x" />\n}\n'],
  },
])

describeRules(config, 'src/lint-jsx.jsx', [
  {
    rule: '@eslint-react/dom-no-unknown-property',
    invalid: [
      'export function A() {\n  return <div class="x" />\n}\n',
      'export function A() {\n  return <div data-fooBar="x" />\n}\n',
    ],
    valid: ['export function A() {\n  return <div className="x" data-foo-bar="x" />\n}\n'],
  },
])

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: 'react-hooks/capitalized-calls',
    invalid: [
      'declare function Row(): null\n\nexport function A() {\n  return <div>{Row()}</div>\n}\n',
    ],
    valid: [
      'declare function Row(): null\n\nexport function A() {\n  return (\n    <div>\n      <Row />\n    </div>\n  )\n}\n',
    ],
  },
  {
    rule: 'react-hooks/incompatible-library',
    invalid: [
      'import { useForm } from "react-hook-form"\n\nexport function Form() {\n  const { watch } = useForm()\n  const name = watch("name")\n  return <div>{String(name)}</div>\n}\n',
    ],
    valid: [],
  },
  // `@eslint-react/rules-of-hooks` reports it instead.
  { rule: 'react-hooks/hooks', invalid: [], valid: [CONDITIONAL_HOOK] },
  // `@eslint-react/exhaustive-deps` reports it instead.
  {
    rule: 'react-hooks/memo-dependencies',
    invalid: [],
    valid: [
      `${HOOKS}export function A({ n }: { n: number }) {\n  const v = useMemo(() => n * 2, [])\n  return <div>{v}</div>\n}\n`,
    ],
  },
])
