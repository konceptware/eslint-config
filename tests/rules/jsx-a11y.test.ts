import base from '../../src/index.ts'
import react from '../../src/react.ts'

import { describeRules } from './cases.ts'

const config = [...base, ...react]

/** A module whose exported component renders `jsx`, with `f` and `n` in scope. */
function render(jsx: string): string {
  return `declare const f: () => void\ndeclare const n: number\ndeclare function UserBadge(props: { role: string }): null\n\nexport function A() {\n  return ${jsx}\n}\n`
}

describeRules(config, 'src/lint-jsx.tsx', [
  {
    rule: 'jsx-a11y-x/alt-text',
    invalid: [render('<img src="/a.png" />'), render('<input type="image" src="/a.png" />')],
    valid: [render('<img src="/a.png" alt="" />'), render('<img src="/a.png" alt="Logo" />')],
  },
  {
    rule: 'jsx-a11y-x/img-redundant-alt',
    invalid: [render('<img src="/a.png" alt="Photo of a dog" />')],
    valid: [render('<img src="/a.png" alt="A dog" />')],
  },
  {
    rule: 'jsx-a11y-x/media-has-caption',
    invalid: [render('<video src="/a.mp4" />')],
    valid: [
      render('<video muted src="/a.mp4" />'),
      render('<video src="/a.mp4">\n      <track kind="captions" src="/a.vtt" />\n    </video>'),
    ],
  },
  {
    rule: 'jsx-a11y-x/iframe-has-title',
    invalid: [render('<iframe sandbox="" src="/x" />')],
    valid: [render('<iframe sandbox="" src="/x" title="Map" />')],
  },
  {
    rule: 'jsx-a11y-x/anchor-has-content',
    invalid: [render('<a href="/x" />')],
    valid: [render('<a href="/x">Home</a>')],
  },
  {
    rule: 'jsx-a11y-x/anchor-is-valid',
    invalid: [
      render('<a>Home</a>'),
      render('<a href="#">Home</a>'),
      render('<a href="#" onClick={f}>Home</a>'),
    ],
    valid: [render('<a href="/x">Home</a>')],
  },
  {
    rule: 'jsx-a11y-x/anchor-ambiguous-text',
    invalid: [render('<a href="/x">click here</a>')],
    valid: [render('<a href="/x">Pricing</a>')],
  },
  {
    rule: 'jsx-a11y-x/label-has-associated-control',
    invalid: [render('<label>Name</label>')],
    valid: [
      render('<label>\n      Name <input />\n    </label>'),
      render('<label htmlFor="name">Name</label>'),
      render(
        '<label>\n      Name\n      <span>\n        <span>\n          <span>\n            <input />\n          </span>\n        </span>\n      </span>\n    </label>',
      ),
    ],
  },
  // Off: it reports correct markup such as a table cell.
  {
    rule: 'jsx-a11y-x/control-has-associated-label',
    invalid: [],
    valid: [render('<td />')],
  },
  {
    rule: 'jsx-a11y-x/heading-has-content',
    invalid: [render('<h2 />')],
    valid: [render('<h2>Title</h2>')],
  },
  {
    rule: 'jsx-a11y-x/html-has-lang',
    invalid: [render('<html>\n      <body />\n    </html>')],
    valid: [render('<html lang="en">\n      <body />\n    </html>')],
  },
  {
    rule: 'jsx-a11y-x/lang',
    invalid: [render('<html lang="xx-bad">\n      <body />\n    </html>')],
    valid: [render('<html lang="en-GB">\n      <body />\n    </html>')],
  },
  {
    rule: 'jsx-a11y-x/autocomplete-valid',
    invalid: [render('<input autoComplete="nope" />')],
    valid: [render('<input autoComplete="email" />')],
  },
  {
    rule: 'jsx-a11y-x/aria-props',
    invalid: [render('<div aria-labeledby="x" />')],
    valid: [render('<div aria-labelledby="x" />')],
  },
  // Off in TS files: tsc rejects the value (TS2322).
  {
    rule: 'jsx-a11y-x/aria-proptypes',
    invalid: [],
    valid: [render('<div aria-hidden="yes" />')],
  },
  {
    rule: 'jsx-a11y-x/aria-role',
    invalid: [render('<div role="buton" />'), render('<UserBadge role="admin" />')],
    valid: [render('<div role="alert" />')],
  },
  {
    rule: 'jsx-a11y-x/aria-unsupported-elements',
    invalid: [render('<meta aria-hidden="true" />')],
    valid: [render('<meta charSet="utf-8" />')],
  },
  {
    rule: 'jsx-a11y-x/role-has-required-aria-props',
    invalid: [render('<span role="checkbox" tabIndex={0} onClick={f} onKeyDown={f} />')],
    valid: [
      render(
        '<span role="checkbox" aria-checked="false" tabIndex={0} onClick={f} onKeyDown={f} />',
      ),
    ],
  },
  {
    rule: 'jsx-a11y-x/role-supports-aria-props',
    invalid: [render('<a href="/x" aria-checked="true">Home</a>')],
    valid: [render('<a href="/x" aria-current="page">Home</a>')],
  },
  {
    rule: 'jsx-a11y-x/aria-activedescendant-has-tabindex',
    invalid: [render('<div aria-activedescendant="opt-1" />')],
    valid: [render('<div aria-activedescendant="opt-1" tabIndex={0} />')],
  },
  {
    rule: 'jsx-a11y-x/no-redundant-roles',
    invalid: [render('<button type="button" role="button">Go</button>')],
    valid: [render('<ul role="list" />'), render('<ol role="list" />')],
  },
  {
    rule: 'jsx-a11y-x/no-aria-hidden-on-focusable',
    invalid: [render('<button type="button" aria-hidden="true">Go</button>')],
    valid: [render('<span aria-hidden="true">★</span>')],
  },
  {
    rule: 'jsx-a11y-x/prefer-tag-over-role',
    invalid: [render('<div role="heading" aria-level={2}>Title</div>')],
    valid: [render('<h2>Title</h2>')],
  },
  {
    rule: 'jsx-a11y-x/no-interactive-element-to-noninteractive-role',
    invalid: [render('<canvas role="img" aria-label="Chart" />')],
    valid: [render('<canvas aria-label="Chart" />')],
  },
  {
    rule: 'jsx-a11y-x/no-noninteractive-element-to-interactive-role',
    invalid: [render('<ul role="listbox" />')],
    valid: [render('<ul />')],
  },
  {
    rule: 'jsx-a11y-x/no-static-element-interactions',
    invalid: [
      render('<div onClick={f} onKeyDown={f} />'),
      render('<div onMouseEnter={f} onFocus={f} />'),
    ],
    valid: [render('<button type="button" onClick={f}>Go</button>')],
  },
  {
    rule: 'jsx-a11y-x/no-noninteractive-element-interactions',
    invalid: [render('<li onClick={f} onKeyDown={f} />')],
    valid: [render('<img src="/a.png" alt="" onLoad={f} onError={f} />')],
  },
  {
    rule: 'jsx-a11y-x/click-events-have-key-events',
    invalid: [render('<div role="button" tabIndex={0} onClick={f} />')],
    valid: [render('<div role="button" tabIndex={0} onClick={f} onKeyDown={f} />')],
  },
  {
    rule: 'jsx-a11y-x/interactive-supports-focus',
    invalid: [render('<div role="slider" aria-valuenow={n} onKeyDown={f} />')],
    valid: [render('<div role="slider" aria-valuenow={n} tabIndex={0} onKeyDown={f} />')],
  },
  {
    rule: 'jsx-a11y-x/mouse-events-have-key-events',
    invalid: [
      render('<a href="/x" onMouseEnter={f}>Home</a>'),
      render('<a href="/x" onMouseLeave={f}>Home</a>'),
    ],
    valid: [
      render(
        '<a href="/x" onMouseEnter={f} onFocus={f} onMouseLeave={f} onBlur={f}>\n      Home\n    </a>',
      ),
    ],
  },
  {
    rule: 'jsx-a11y-x/no-noninteractive-tabindex',
    invalid: [render('<section aria-label="Code" tabIndex={0} />')],
    valid: [render('<div role="tabpanel" tabIndex={0} />')],
  },
  {
    rule: 'jsx-a11y-x/tabindex-no-positive',
    invalid: [render('<button type="button" tabIndex={1}>Go</button>')],
    valid: [render('<button type="button" tabIndex={0}>Go</button>')],
  },
  {
    rule: 'jsx-a11y-x/no-autofocus',
    invalid: [render('<input autoFocus />')],
    valid: [render('<input />')],
  },
  {
    rule: 'jsx-a11y-x/no-access-key',
    invalid: [render('<button type="button" accessKey="s">Save</button>')],
    valid: [render('<button type="button">Save</button>')],
  },
  {
    rule: 'jsx-a11y-x/no-distracting-elements',
    invalid: [render('<marquee />'), render('<blink />')],
    valid: [render('<p />')],
  },
  {
    rule: 'jsx-a11y-x/scope',
    invalid: [render('<td scope="col" />')],
    valid: [render('<th scope="col" />')],
  },
])

describeRules(config, 'src/lint-jsx.jsx', [
  {
    rule: 'jsx-a11y-x/aria-proptypes',
    invalid: ['export function A() {\n  return <div aria-hidden="yes" />\n}\n'],
    valid: ['export function A() {\n  return <div aria-hidden="true" />\n}\n'],
  },
])
