/* ШАПКА САЙТА: логотип с кроликом (ведёт на главную), меню «Practice tests» (бесплатные варианты), выпадающие меню «The exam»
   и «Module N» (учебник), кнопка кабинета («Log in» или имя вошедшего),
   кнопка «Contents» (оглавление во всплывающей панели; на телефонах меню скрыты и остаётся только она).
   Выпадающие меню и панель сделаны на библиотеке Radix (radix-ui): она отвечает за открытие/закрытие,
   клавиатуру и доступность, а внешний вид задаёт styles.css. */
import { useState } from "react";
import { Dialog, DropdownMenu } from "radix-ui";
import { Topic, Universal } from "../types";
import { View, moduleItems, samePage, toHash } from "../route";
import { RabbitMark } from "./Rabbit";
import { Contents } from "./Cover";
import { useUser } from "../demo";
import { variants } from "./Variant";

/** here — открытая страница (для подсветки), last — последняя открытая (передаётся в оглавление) */
type Props = { topics: Topic[]; universal: Universal; here: View; last: View | null };

/** One dropdown in the header: a trigger and a list of links
    Одно выпадающее меню: name — надпись на кнопке, sub — заголовок внутри меню, on — подсветить кнопку
    (открыт этот раздел), items — ссылки. aria-current="page" отмечает текущую страницу */
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

/** Шапка целиком. open — открыта ли панель «Contents».
    Меню модуля подсвечивается, если у открытой страницы есть номер модуля t и он совпадает ("t" in here) */
export default function Header(p: Props) {
  const { topics, universal, here } = p;
  const [open, setOpen] = useState(false);
  const user = useUser();
  // меню «Practice tests»: варианты из файлов контента (module = "variant") и страница со всеми вариантами
  const tests: { v: View; text: string; no: string | number }[] = [...variants().map((x, i) => ({ v: { k: "variant", i, tab: 0 } as View, text: x.title, no: i + 1 })), { v: { k: "free" }, text: "All practice tests", no: "·" }];
  // кабинет: гость — «Log in», вошедший — его имя (на телефоне — только первая буква)
  const account = <a className={`site-header__account${here.k === "cabinet" ? " site-header__account--active" : ""}`} href={user ? "#/cabinet" : "#/login"}>
    {user ? <><b className="site-header__avatar" aria-hidden="true">{user.name[0]}</b><span className="site-header__account-name">{user.name}</span></> : "Log in"}</a>;
  return <header className="site-header">
    <a className="site-header__logo" href="#/" aria-label="EGE English: home"><RabbitMark /><span className="site-header__logo-text">EGE <i className="site-header__logo-dot">·</i> English</span></a>
    <nav className="site-header__nav" aria-label="Course">
      <Menu name="Practice tests" sub="Free EGE variants" on={here.k === "free" || here.k === "variant"} here={here} topics={topics} items={tests} />
      <Menu name="The exam" sub={universal.subtitle} on={here.k === "u"} here={here} topics={topics}
        items={universal.pages.map((pg, i) => ({ v: { k: "u", i }, text: pg.title, no: i + 1 }))} />
      {topics.map((t, ti) => <Menu key={t.id} name={`Module ${ti + 1}`} sub={t.title} on={"t" in here && here.t === ti} here={here} topics={topics}
        items={moduleItems(t, ti).map(x => ({ v: x.v, text: x.title, no: x.no }))} />)}
    </nav>
    {account}
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="site-header__contents-button"><svg className="site-header__contents-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 6h14M3 10h14M3 14h9" /></svg>Contents</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="contents-panel" aria-describedby={undefined}>
          <div className="contents-panel__header"><Dialog.Title className="contents-panel__title">Contents</Dialog.Title><Dialog.Close className="contents-panel__close" aria-label="Close">✕</Dialog.Close></div>
          <nav className="contents-panel__links" onClick={() => setOpen(false)}><a href="#/">Home</a><a href="#/free">Practice tests</a>{tests.slice(0, -1).map(x => <a key={x.text} href={"#" + toHash(x.v, topics)}>{x.text}</a>)}<a href="#/book">Textbook</a><a href={user ? "#/cabinet" : "#/login"}>{user ? "My account" : "Log in"}</a></nav>
          <Contents {...p} onPick={() => setOpen(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </header>;
}
