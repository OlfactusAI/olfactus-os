"use client";

import {
  BookOpen,
  Building2,
  Clock3,
  FlaskConical,
  GitBranch,
  History,
  Search,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useRouter,
} from "next/navigation";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  loadImportedCatalog,
} from "@/lib/database/import";
import {
  buildUniversalSearchIndex,
  clearUniversalSearchHistory,
  loadRecentSearchEntities,
  loadRecentSearchQueries,
  saveRecentSearchEntity,
  saveRecentSearchQuery,
  searchUniversalIndex,
  type RecentSearchEntity,
  type UniversalSearchDocument,
  type UniversalSearchEntityType,
  type UniversalSearchHit,
  type UniversalSearchIndex,
} from "@/lib/search";

type SearchFilter =
  | "all"
  | UniversalSearchEntityType;

const filters:
  Array<{
    value: SearchFilter;
    label: string;
  }> = [
    {
      value: "all",
      label: "All",
    },
    {
      value: "fragrance",
      label: "Fragrances",
    },
    {
      value: "brand",
      label: "Brands",
    },
    {
      value: "perfumer",
      label: "Perfumers",
    },
    {
      value: "note",
      label: "Notes",
    },
    {
      value: "accord",
      label: "Accords",
    },
    {
      value: "ingredient",
      label: "Ingredients",
    },
    {
      value: "line",
      label: "Lines",
    },
  ];

export function GlobalSearch() {
  const router = useRouter();
  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    );
  const [open, setOpen] =
    useState(false);
  const [query, setQuery] =
    useState("");
  const [filter, setFilter] =
    useState<SearchFilter>("all");
  const [activeIndex, setActiveIndex] =
    useState(0);
  const [searchIndex, setSearchIndex] =
    useState<UniversalSearchIndex>(
      () =>
        buildUniversalSearchIndex({
          catalog: fragrances,
        }),
    );
  const [
    recentQueries,
    setRecentQueries,
  ] = useState<string[]>([]);
  const [
    recentEntities,
    setRecentEntities,
  ] = useState<
    RecentSearchEntity[]
  >([]);

  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();
        setOpen(
          (current) =>
            !current,
        );
      }

      if (
        event.key ===
        "Escape"
      ) {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setFilter("all");
      setActiveIndex(0);
      return;
    }

    setSearchIndex(
      buildUniversalSearchIndex({
        catalog: fragrances,
        importedCatalog:
          loadImportedCatalog(),
      }),
    );
    setRecentQueries(
      loadRecentSearchQueries(),
    );
    setRecentEntities(
      loadRecentSearchEntities(),
    );

    window.setTimeout(
      () =>
        inputRef.current?.focus(),
      0,
    );
  }, [open]);

  const result = useMemo(
    () =>
      searchUniversalIndex({
        index: searchIndex,
        query,
        options: {
          entityTypes:
            filter === "all"
              ? undefined
              : [filter],
          limit: 40,
          limitPerGroup: 8,
          typoTolerance: 2,
        },
      }),
    [
      filter,
      query,
      searchIndex,
    ],
  );

  const flatHits =
    result.groups.flatMap(
      (group) =>
        group.hits,
    );

  useEffect(() => {
    setActiveIndex(0);
  }, [query, filter]);

  function openDocument(
    document:
      UniversalSearchDocument,
  ) {
    saveRecentSearchQuery(
      query,
    );
    saveRecentSearchEntity(
      document,
    );
    router.push(
      document.route,
    );
    setOpen(false);
  }

  function openRecent(
    item: RecentSearchEntity,
  ) {
    router.push(item.route);
    setOpen(false);
  }

  function clearHistory() {
    clearUniversalSearchHistory();
    setRecentQueries([]);
    setRecentEntities([]);
  }

  function handleInputKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();
      setActiveIndex(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              0,
              flatHits.length - 1,
            ),
          ),
      );
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
      event.preventDefault();
      setActiveIndex(
        (current) =>
          Math.max(
            0,
            current - 1,
          ),
      );
    }

    if (
      event.key ===
        "Enter" &&
      flatHits[activeIndex]
    ) {
      event.preventDefault();
      openDocument(
        flatHits[activeIndex]
          .document,
      );
    }
  }

  return (
    <>
      <button
        type="button"
        className="global-search-trigger"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Search OLFACTUS"
      >
        <Search size={15} />
        <span>
          Search intelligence
        </span>
        <kbd>⌘K</kbd>
      </button>

      {open ? (
        <div
          className="global-search-backdrop"
          role="presentation"
          onMouseDown={(
            event,
          ) => {
            if (
              event.currentTarget ===
              event.target
            ) {
              setOpen(false);
            }
          }}
        >
          <section
            className="global-search-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Universal search"
          >
            <header className="global-search-header">
              <Search size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={(
                  event,
                ) =>
                  setQuery(
                    event.target
                      .value,
                  )
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder="Search fragrances, brands, perfumers, notes…"
                aria-label="Universal search query"
              />
              <button
                type="button"
                className="global-search-close"
                onClick={() =>
                  setOpen(false)
                }
                aria-label="Close search"
              >
                <X size={17} />
              </button>
            </header>

            <div className="global-search-filters">
              {filters.map(
                (item) => (
                  <button
                    key={
                      item.value
                    }
                    type="button"
                    className={
                      filter ===
                      item.value
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setFilter(
                        item.value,
                      )
                    }
                  >
                    {item.label}
                  </button>
                ),
              )}
            </div>

            <div className="global-search-body">
              {query.trim() ? (
                result.total ? (
                  <SearchResults
                    groups={
                      result.groups
                    }
                    flatHits={
                      flatHits
                    }
                    activeIndex={
                      activeIndex
                    }
                    onOpen={
                      openDocument
                    }
                  />
                ) : (
                  <NoResults
                    query={query}
                    onImport={() => {
                      router.push(
                        "/import",
                      );
                      setOpen(false);
                    }}
                  />
                )
              ) : (
                <SearchStart
                  recentQueries={
                    recentQueries
                  }
                  recentEntities={
                    recentEntities
                  }
                  onQuery={
                    setQuery
                  }
                  onOpenRecent={
                    openRecent
                  }
                  onClear={
                    clearHistory
                  }
                />
              )}
            </div>

            <footer className="global-search-footer">
              <span>
                ↑↓ Navigate
              </span>
              <span>
                ↵ Open
              </span>
              <span>
                Esc Close
              </span>
              <strong>
                {
                  searchIndex
                    .documents
                    .length
                }{" "}
                indexed entities
              </strong>
            </footer>
          </section>
        </div>
      ) : null}
    </>
  );
}

function SearchResults({
  groups,
  flatHits,
  activeIndex,
  onOpen,
}: {
  groups:
    ReturnType<
      typeof searchUniversalIndex
    >["groups"];
  flatHits:
    UniversalSearchHit[];
  activeIndex: number;
  onOpen: (
    document:
      UniversalSearchDocument,
  ) => void;
}) {
  let runningIndex = 0;

  return (
    <div className="global-search-groups">
      {groups.map(
        (group) => (
          <section
            key={
              group.entityType
            }
            className="global-search-group"
          >
            <div className="global-search-group-title">
              <span>
                {group.label}
              </span>
              <small>
                {
                  group.hits
                    .length
                }
              </small>
            </div>

            {group.hits.map(
              (hit) => {
                const index =
                  runningIndex;
                runningIndex += 1;
                const Icon =
                  entityIcon(
                    hit.document
                      .entityType,
                  );

                return (
                  <button
                    type="button"
                    key={
                      hit.document
                        .id
                    }
                    className={
                      index ===
                      activeIndex
                        ? "global-search-result is-active"
                        : "global-search-result"
                    }
                    onMouseEnter={() => {
                      const target =
                        flatHits.findIndex(
                          (
                            candidate,
                          ) =>
                            candidate
                              .document
                              .id ===
                            hit.document
                              .id,
                        );
                      const element =
                        document.querySelector(
                          `[data-search-index="${target}"]`,
                        );
                      element?.setAttribute(
                        "data-hovered",
                        "true",
                      );
                    }}
                    onClick={() =>
                      onOpen(
                        hit.document,
                      )
                    }
                    data-search-index={
                      index
                    }
                  >
                    <span className="global-search-result-icon">
                      <Icon
                        size={17}
                      />
                    </span>

                    <span className="min-w-0 flex-1 text-left">
                      <strong>
                        {
                          hit.document
                            .label
                        }
                      </strong>
                      <small>
                        {
                          hit.document
                            .subtitle
                        }
                      </small>
                      <em>
                        {
                          hit.explanation
                        }
                      </em>
                    </span>

                    <span className="global-search-score">
                      {hit.score}
                    </span>

                    {hit.document
                      .source ===
                    "imported" ? (
                      <span className="global-search-imported">
                        Imported
                      </span>
                    ) : null}
                  </button>
                );
              },
            )}
          </section>
        ),
      )}
    </div>
  );
}

function SearchStart({
  recentQueries,
  recentEntities,
  onQuery,
  onOpenRecent,
  onClear,
}: {
  recentQueries: string[];
  recentEntities:
    RecentSearchEntity[];
  onQuery: (
    query: string,
  ) => void;
  onOpenRecent: (
    item:
      RecentSearchEntity,
  ) => void;
  onClear: () => void;
}) {
  const suggestions = [
    "Aventus",
    "Creed",
    "Pineapple",
    "Woody",
  ];

  return (
    <div className="global-search-start">
      <div className="global-search-start-header">
        <div>
          <p className="global-search-kicker">
            Universal Intelligence
          </p>
          <h2 className="display-serif mt-2 text-4xl">
            Search the system
          </h2>
        </div>

        {recentQueries.length ||
        recentEntities.length ? (
          <button
            type="button"
            onClick={onClear}
          >
            Clear history
          </button>
        ) : null}
      </div>

      {recentEntities.length ? (
        <section className="global-search-start-section">
          <h3>
            Recently opened
          </h3>
          <div className="global-search-recent-grid">
            {recentEntities
              .slice(0, 4)
              .map((item) => {
                const Icon =
                  entityIcon(
                    item.entityType,
                  );
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() =>
                      onOpenRecent(
                        item,
                      )
                    }
                  >
                    <Icon
                      size={16}
                    />
                    <span>
                      <strong>
                        {
                          item.label
                        }
                      </strong>
                      <small>
                        {
                          item.subtitle
                        }
                      </small>
                    </span>
                  </button>
                );
              })}
          </div>
        </section>
      ) : null}

      {recentQueries.length ? (
        <section className="global-search-start-section">
          <h3>
            Recent searches
          </h3>
          <div className="global-search-query-chips">
            {recentQueries.map(
              (item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    onQuery(item)
                  }
                >
                  <History
                    size={13}
                  />
                  {item}
                </button>
              ),
            )}
          </div>
        </section>
      ) : null}

      <section className="global-search-start-section">
        <h3>
          Suggested
        </h3>
        <div className="global-search-query-chips">
          {suggestions.map(
            (item) => (
              <button
                type="button"
                key={item}
                onClick={() =>
                  onQuery(item)
                }
              >
                <Sparkles
                  size={13}
                />
                {item}
              </button>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function NoResults({
  query,
  onImport,
}: {
  query: string;
  onImport: () => void;
}) {
  return (
    <div className="global-search-empty">
      <Search size={28} />
      <h2 className="display-serif">
        No result for “{query}”
      </h2>
      <p>
        Check the spelling, broaden the
        query, or import the missing
        fragrance data.
      </p>
      <button
        type="button"
        onClick={onImport}
      >
        Open Import Workspace
      </button>
    </div>
  );
}

function entityIcon(
  type:
    UniversalSearchEntityType,
) {
  if (type === "brand") {
    return Building2;
  }
  if (type === "perfumer") {
    return UserRound;
  }
  if (
    type === "note" ||
    type === "accord" ||
    type === "ingredient"
  ) {
    return FlaskConical;
  }
  if (type === "line") {
    return GitBranch;
  }
  if (type === "fragrance") {
    return Sparkles;
  }

  return BookOpen;
}
