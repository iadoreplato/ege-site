import { useState } from "react";
import { Dialog, DropdownMenu } from "radix-ui";
import { Topic, Universal } from "../types";
import { View, moduleItems, samePage, toHash } from "../route";
import { RabbitMark } from "./Rabbit";
import { Contents } from "./Cover";

type Props = { topics: Topic[]; universal: Universal; here: View; last: View | null };

/** One dropdown in the header: a trigger and a list of links */
function Menu({ name, sub, on, items, here, topics }: { name: string; sub?: string; on: boolean; items: { v: View; text: string; no?: string | number }[]; here: View; topics: Topic[] }) {
  return <DropdownMenu.Root modal={false}>
    <DropdownMenu.Trigger className={`site-header__menu-button${on ? " site-header__menu-button--active" : ""}`}>{name}<svg className="site-header__menu-arrow" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5 6 7.5 9 4.5" /></svg></DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="dropdown" align="start" sideOffset={10}>
        {sub && <DropdownMenu.Label className="dropdown__title">{sub}</DropdownMenu.Label>}
        {items.map(({ v, text, no }) => <DropdownMenu.Item key={text} asChild>
          <a className="dropdown__link" href={"#" + toHash(v, topics)} aria-current={samePage(v, here) ? "page" : undefined}><span className="dropdown__number">{no}</span>{text}</a>
        </DropdownMenu.Item>)}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}

export default function Header(p: Props) {
  const { topics, universal, here } = p;
  const [open, setOpen] = useState(false);
  return <header className="site-header">
    <a className="site-header__logo" href="#/" aria-label="EGE English: cover and contents"><RabbitMark /><span>EGE <i className="site-header__logo-dot">·</i> English</span></a>
    <nav className="site-header__nav" aria-label="Course">
      <Menu name="The exam" sub={universal.subtitle} on={here.k === "u"} here={here} topics={topics}
        items={universal.pages.map((pg, i) => ({ v: { k: "u", i }, text: pg.title, no: i + 1 }))} />
      {topics.map((t, ti) => <Menu key={t.id} name={`Module ${ti + 1}`} sub={t.title} on={"t" in here && here.t === ti} here={here} topics={topics}
        items={moduleItems(t, ti).map(x => ({ v: x.v, text: x.title, no: x.no }))} />)}
    </nav>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="site-header__contents-button"><svg className="site-header__contents-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h9" /></svg>Contents</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="contents-panel" aria-describedby={undefined}>
          <div className="contents-panel__header"><Dialog.Title className="contents-panel__title">Contents</Dialog.Title><Dialog.Close className="contents-panel__close" aria-label="Close">✕</Dialog.Close></div>
          <Contents {...p} onPick={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </header>;
}
