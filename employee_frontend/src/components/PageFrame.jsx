export default function PageFrame({ eyebrow, title, description, children, action }) {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-12 pt-6 sm:px-8 lg:px-12 lg:pt-10">
      <header className="mb-8 flex flex-col justify-between gap-5 border-b border-[#d9d8ce] pb-7 sm:flex-row sm:items-end">
        <div>
          <p className="mono mb-2 text-[10px] uppercase tracking-[0.22em] text-[#71806f]">{eyebrow}</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-[#26332e] sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#718078]">{description}</p>
        </div>
        {action}
      </header>
      {children}
    </div>
  )
}
