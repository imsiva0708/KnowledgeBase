  import Markdown from "./Markdown"
  import ImageCard from "./ImageCard"

  function ContentDisplay({ data }) {
    const title = data?.title || data?.name || "Untitled";
    const date = data?.date || data?.created_at || "—";
    const authors = data?.authors || (data?.author ? [data.author] : null) || data?.group_name || [];
    const images = data?.images || [];

    if (!data) return <p className="text-on-surface">No data</p>

    return (
      <div className="bg-background font-body text-on-surface selection:bg-primary/30">
        <main className="pt-24 pb-32 max-w-[1400px] mx-auto px-8 lg:px-16 flex flex-col gap-24">
          <div className="flex flex-col lg:flex-row gap-16 items-start">
            <section className="lg:w-[70%] prose max-w-none">
              <header className="mb-16">
                <span className="font-label text-[10px] uppercase tracking-widest text-primary mb-4 block">{data?.category || 'Research Memo / Knowledge'}</span>
                <h1 className="font-headline">{title}</h1>
                <div className="flex items-center gap-6 text-on-surface-variant text-sm font-label uppercase tracking-wider mt-8">
                  <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">calendar_today</span> {date}</span>
                  {authors && authors.length > 0 && <span className="flex items-center gap-2"><span className="material-symbols-outlined text-xs">person</span> {Array.isArray(authors) ? authors.join(', ') : authors}</span>}
                </div>
              </header>

              {data.md_notes ? (
                <Markdown content={data.md_notes} />
              ) : (
                <p className="text-on-surface-variant">No article body available.</p>
              )}
            </section>

            <aside className="lg:w-[30%] lg:sticky lg:top-24 max-h-[calc(100vh-160px)] overflow-y-auto pr-2 flex flex-col gap-6">
              {images.length === 0 ? (
                <div className="p-4 bg-surface-container-low rounded-xl text-on-surface-variant">No images</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {images.map((img, idx) => (
                    <ImageCard key={idx} img={img} idx={idx} />
                  ))}
                </div>
              )}
            </aside>
          </div>

          <section className="w-full border-t border-outline-variant/5 pt-16">
            <div className="grid md:grid-cols-2 gap-16">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">hub</span>
                  <h3 className="font-label text-xs font-bold uppercase tracking-[0.2em] text-on-surface">External Sources</h3>
                </div>
                <div className="grid gap-4">
                  {(data.article_links || []).map((link, i) => (
                    <a
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all group"
                      href={typeof link === 'string' ? link : (link.url || '#')}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="w-10 h-10 rounded flex items-center justify-center bg-primary-container/20 text-primary">
                        <span className="material-symbols-outlined">article</span>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{link.title || link}</div>
                        <div className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">{link.source || ''}</div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
                    </a>
                  ))}
                  
                  {(data.video_links || []).length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-label text-xs uppercase tracking-wider text-on-surface-variant">Video Links</h4>
                      <div className="grid gap-4 mt-2">
                        {(data.video_links || []).map((link, idx) => (
                          <a key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all group" href={typeof link === 'string' ? link : (link.url || '#')} target="_blank" rel="noopener noreferrer">
                            <div className="w-10 h-10 rounded flex items-center justify-center bg-primary-container/20 text-primary">
                              <span className="material-symbols-outlined">play_circle</span>
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{(typeof link === 'string') ? link : (link.title || link)}</div>
                              <div className="text-[10px] text-on-surface-variant font-label uppercase tracking-wider">{(typeof link === 'string') ? '' : (link.source || '')}</div>
                            </div>
                            <span className="material-symbols-outlined text-on-surface-variant text-sm">open_in_new</span>
                          </a>
                        ))}
                        
                      </div>
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          </section>
        </main>

        <footer className="bg-[#000000] w-full py-12 px-8">
          <div className="bg-[#191a1a] h-px w-full mb-8"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="font-['Manrope'] uppercase tracking-widest text-[10px] text-[#acabaa]">© 2024 Obsidian Flow Knowledge Management</div>
            <div className="flex gap-8">
              <a className="font-['Manrope'] uppercase tracking-widest text-[10px] text-[#acabaa] hover:text-[#e7e5e5] transition-colors opacity-80 hover:opacity-100" href="#">Documentation</a>
              <a className="font-['Manrope'] uppercase tracking-widest text-[10px] text-[#acabaa] hover:text-[#e7e5e5] transition-colors opacity-80 hover:opacity-100" href="#">Privacy</a>
              <a className="font-['Manrope'] uppercase tracking-widest text-[10px] text-[#acabaa] hover:text-[#e7e5e5] transition-colors opacity-80 hover:opacity-100" href="#">Support</a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  export default ContentDisplay