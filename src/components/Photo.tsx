/* ФОТО К ЗАДАНИЯМ 2, 3, 4. Если в public/img/photos/ (или public/photos/) есть файл с нужным именем, показывается фото,
   иначе — иконка (то, что вложено внутрь <Photo>…</Photo>). */
import { ReactNode, useState } from "react";

/* Чтобы заменить иконку на фото, положи файл с таким именем в public/img/photos/ или public/photos/
   (подойдут .jpg и .webp). Сравнение фото: sport-u3-1.jpg, sport-u3-2.jpg, variant-1-1.jpg…; реклама: sport-u3-ad.jpg, variant-1-ad.jpg. Список всех имён — в public/photos/README.md.
   Если файла нет, показывается иконка (то, что передано внутрь Photo). */
const EXT = ["jpg", "webp"];              // какие расширения пробовать, по порядку
const DIRS = ["img/photos", "photos"];  // в каких папках public/ искать (сначала новая, потом прежняя)
const TASK: Record<string, number> = { reading: 1, ad: 2, interview: 3, photo: 4, email: 37, essay: 38 }; // тип задания → номер

/** File name of a task's photo (and of its voice recording): sport-u1-task4, sport-u7-task2-2 for the second Task 2 in a unit
    Имя файла фото и записи: <модуль>-u<юнит>-task<номер>; для второго задания того же типа в юните добавляется -2 */
export const slotName = (topicId: string, unitNum: number, type: string, n: number) =>
  `${topicId}-u${unitNum}-task${TASK[type] ?? type}${n > 1 ? `-${n}` : ""}`;

/** Имена фото для сравнения (задание 4) и рекламы (задание 2) по слоту задания:
    юнит  «sport-u1-task4» → sport-u1-1 / sport-u1-2; «sport-u7-task2-3» → sport-u7-ad-3 (первая реклама — sport-u1-ad или sport-u1-ad-1);
    вариант «variant-2-photo» → variant-2-1 / variant-2-2, «variant-2-ad» → variant-2-ad.
    В конце — прежнее имя (sport-u1-task4-photo1, sport-u1-task2), чтобы старые файлы тоже работали */
export function photoNames(slot: string, kind: "photo1" | "photo2" | "ad"): string[] {
  const m = slot.match(/^(.+-u\d+)-task\d+(?:-(\d+))?$/) || slot.match(/^(variant-\d+)-\w+$/);
  const base = m?.[1] ?? slot, n = Number(m?.[2] ?? 1), legacy = kind === "ad" ? slot : `${slot}-${kind}`;
  const names = kind === "ad" ? (n === 1 ? [`${base}-ad`, `${base}-ad-1`] : [`${base}-ad-${n}`]) : [`${base}-${kind.slice(-1)}`];
  return [...names, legacy];
}

/** Фото задания. Пробует по очереди все имена (name — одно или список), папки DIRS и расширения EXT:
    не загрузилось (onError) — следующий вариант. i — номер пробуемого варианта; ok — фото загрузилось.
    Пока фото нет, видна иконка (children); картинка — невидимая точка 1 px (photo-probe), но грузится.
    Не hidden: спрятанную картинку с loading="lazy" браузер не загружает вовсе.
    Если ни один вариант не подошёл — остаётся только иконка. onFound — сообщить, что настоящее фото есть */
export function Photo({ name, alt, className, children, onFound }: { name: string | string[]; alt: string; className?: string; children?: ReactNode; onFound?: () => void }) {
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(false);
  const urls = [name].flat().flatMap(n => DIRS.flatMap(d => EXT.map(e => `${import.meta.env.BASE_URL}${d}/${n}.${e}`)));
  if (i >= urls.length) return <>{children}</>;
  return <>
    {!ok && children}
    <img className={ok ? className : `${className ?? ""} photo-probe`} src={urls[i]} alt={alt} loading="lazy"
      onLoad={() => { setOk(true); onFound?.(); }} onError={() => setI(i + 1)} />
  </>;
}
