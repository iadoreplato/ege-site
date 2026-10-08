import { ReactNode, useState } from "react";

/* Чтобы заменить иконку на фото, положи файл с таким именем сюда: public/photos/<имя>.jpg
   (подойдут .jpg, .jpeg, .png, .webp). Список всех имён — в public/photos/README.md.
   Если файла нет, показывается иконка (то, что передано внутрь Photo). */
const EXT = ["jpg", "jpeg", "png", "webp"];
const TASK: Record<string, number> = { reading: 1, ad: 2, interview: 3, photo: 4, email: 37, essay: 38 };

/** File name of a task's photo (and of its voice recording): sport-u1-task4, sport-u7-task2-2 for the second Task 2 in a unit */
export const slotName = (topicId: string, unitNum: number, type: string, n: number) =>
  `${topicId}-u${unitNum}-task${TASK[type] ?? type}${n > 1 ? `-${n}` : ""}`;

export function Photo({ name, alt, className, children }: { name: string; alt: string; className?: string; children?: ReactNode }) {
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(false);
  if (i >= EXT.length) return <>{children}</>;
  return <>
    {!ok && children}
    <img className={className} hidden={!ok} src={`${import.meta.env.BASE_URL}photos/${name}.${EXT[i]}`} alt={alt}
      onLoad={() => setOk(true)} onError={() => setI(i + 1)} />
  </>;
}
