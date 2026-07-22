"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

type Book = {
  title: string;
  spineTitle: string;
  author: string;
  spineAuthor: string;
  spineSubtitle?: string;
  spinePublisher: string;
  spineDesign: string;
  spineWidth: number;
  cover: string;
  coverWidth: number;
  coverHeight: number;
  spineColor: string;
  spineInk: string;
  url: string;
};

const books: Book[] = [
  {
    title: "Homo Deus",
    spineTitle: "HOMO DEUS",
    author: "Yuval Noah Harari",
    spineAuthor: "YUVAL NOAH HARARI",
    spineSubtitle: "A BRIEF HISTORY OF TOMORROW",
    spinePublisher: "HARPER",
    spineDesign: "homo-deus",
    spineWidth: 25,
    cover: "/books/homo-deus.jpg",
    coverWidth: 329,
    coverHeight: 500,
    spineColor: "#303033",
    spineInk: "#f4eee5",
    url: "https://openlibrary.org/books/OL27226513M/Homo_deus",
  },
  {
    title: "Zero to One",
    spineTitle: "ZERO TO ONE",
    author: "Peter Thiel with Blake Masters",
    spineAuthor: "PETER THIEL",
    spineSubtitle: "WITH BLAKE MASTERS",
    spinePublisher: "CROWN BUSINESS",
    spineDesign: "zero-to-one",
    spineWidth: 19,
    cover: "/books/zero-to-one.jpg",
    coverWidth: 332,
    coverHeight: 500,
    spineColor: "#7899ba",
    spineInk: "#171717",
    url: "https://www.penguinrandomhouse.com/books/234730/zero-to-one-by-peter-thiel-with-blake-masters/",
  },
  {
    title: "The Intelligent Investor",
    spineTitle: "THE INTELLIGENT INVESTOR",
    author: "Benjamin Graham",
    spineAuthor: "BENJAMIN GRAHAM",
    spineSubtitle: "REVISED EDITION",
    spinePublisher: "HARPER BUSINESS",
    spineDesign: "intelligent-investor",
    spineWidth: 30,
    cover: "/books/intelligent-investor.jpg",
    coverWidth: 325,
    coverHeight: 500,
    spineColor: "#8c281c",
    spineInk: "#fff8e8",
    url: "https://www.overdrive.com/media/37031/the-intelligent-investor-revised-edition",
  },
  {
    title: "The Inequality Paradox",
    spineTitle: "THE INEQUALITY PARADOX",
    author: "Douglas McWilliams",
    spineAuthor: "DOUGLAS McWILLIAMS",
    spineSubtitle: "HOW CAPITALISM CAN WORK FOR EVERYONE",
    spinePublisher: "OVERLOOK DUCKWORTH",
    spineDesign: "inequality-paradox",
    spineWidth: 25,
    cover: "/books/inequality-paradox.jpg",
    coverWidth: 920,
    coverHeight: 1389,
    spineColor: "#75b844",
    spineInk: "#17210f",
    url: "https://www.abramsbooks.com/product/inequality-paradox_9781468314984/",
  },
  {
    title: "Atomic Habits",
    spineTitle: "ATOMIC HABITS",
    author: "James Clear",
    spineAuthor: "JAMES CLEAR",
    spineSubtitle: "TINY CHANGES, REMARKABLE RESULTS",
    spinePublisher: "AVERY",
    spineDesign: "atomic-habits",
    spineWidth: 24,
    cover: "/books/atomic-habits.jpg",
    coverWidth: 331,
    coverHeight: 500,
    spineColor: "#e7d8bd",
    spineInk: "#201c17",
    url: "https://www.penguinrandomhouse.com/books/543993/atomic-habits-by-james-clear/9780735211292/",
  },
  {
    title: "A Little History of Economics",
    spineTitle: "A LITTLE HISTORY OF ECONOMICS",
    author: "Niall Kishtainy",
    spineAuthor: "NIALL KISHTAINY",
    spinePublisher: "YALE",
    spineDesign: "little-history",
    spineWidth: 21,
    cover: "/books/little-history-economics.jpg",
    coverWidth: 320,
    coverHeight: 500,
    spineColor: "#b32620",
    spineInk: "#fff8e8",
    url: "https://yalebooks.yale.edu/book/9780300226317/a-little-history-of-economics/",
  },
  {
    title: "The Power of Habit",
    spineTitle: "THE POWER OF HABIT",
    author: "Charles Duhigg",
    spineAuthor: "CHARLES DUHIGG",
    spineSubtitle: "10TH ANNIVERSARY EDITION",
    spinePublisher: "RANDOM HOUSE",
    spineDesign: "power-of-habit",
    spineWidth: 25,
    cover: "/books/power-of-habit.jpg",
    coverWidth: 290,
    coverHeight: 450,
    spineColor: "#f2d813",
    spineInk: "#1d1b16",
    url: "https://www.penguinrandomhouse.com/books/202855/the-power-of-habit-by-charles-duhigg/9780812981605/",
  },
  {
    title: "Becoming Supernatural",
    spineTitle: "BECOMING SUPERNATURAL",
    author: "Dr Joe Dispenza",
    spineAuthor: "DR JOE DISPENZA",
    spineSubtitle: "HOW COMMON PEOPLE ARE DOING THE UNCOMMON",
    spinePublisher: "HAY HOUSE",
    spineDesign: "becoming-supernatural",
    spineWidth: 24,
    cover: "/books/becoming-supernatural.jpg",
    coverWidth: 333,
    coverHeight: 500,
    spineColor: "#a8c5bd",
    spineInk: "#17201d",
    url: "https://www.penguinrandomhouse.com/books/598767/becoming-supernatural-by-dr-joe-dispenza/",
  },
  {
    title: "The Hard Thing About Hard Things",
    spineTitle: "THE HARD THING ABOUT HARD THINGS",
    author: "Ben Horowitz",
    spineAuthor: "BEN HOROWITZ",
    spineSubtitle: "BUILDING A BUSINESS WHEN THERE ARE NO EASY ANSWERS",
    spinePublisher: "HARPER BUSINESS",
    spineDesign: "hard-thing",
    spineWidth: 24,
    cover: "/books/hard-thing-about-hard-things.jpg",
    coverWidth: 301,
    coverHeight: 500,
    spineColor: "#171a1a",
    spineInk: "#ff4d18",
    url: "https://www.harpercollins.com/products/the-hard-thing-about-hard-things-ben-horowitz",
  },
  {
    title: "The 5 AM Club",
    spineTitle: "THE 5 AM CLUB",
    author: "Robin Sharma",
    spineAuthor: "ROBIN SHARMA",
    spineSubtitle: "OWN YOUR MORNING. ELEVATE YOUR LIFE.",
    spinePublisher: "HARPER COLLINS",
    spineDesign: "five-am-club",
    spineWidth: 23,
    cover: "/books/five-am-club.jpg",
    coverWidth: 327,
    coverHeight: 500,
    spineColor: "#f8f7f2",
    spineInk: "#e36c29",
    url: "https://books.google.com/books/about/The_5_AM_Club_Own_Your_Morning_Elevate_Y.html?id=7W9bDwAAQBAJ",
  },
  {
    title: "The 4-Hour Workweek",
    spineTitle: "THE 4-HOUR WORKWEEK",
    author: "Timothy Ferriss",
    spineAuthor: "TIMOTHY FERRISS",
    spineSubtitle: "EXPANDED AND UPDATED",
    spinePublisher: "HARMONY",
    spineDesign: "four-hour-workweek",
    spineWidth: 28,
    cover: "/books/four-hour-workweek.jpg",
    coverWidth: 333,
    coverHeight: 500,
    spineColor: "#f5a018",
    spineInk: "#ce2635",
    url: "https://www.penguinrandomhouse.com/books/49081/the-4-hour-workweek-expanded-and-updated-by-timothy-ferriss/",
  },
  {
    title: "The Psychology of Money",
    spineTitle: "THE PSYCHOLOGY OF MONEY",
    author: "Morgan Housel",
    spineAuthor: "MORGAN HOUSEL",
    spineSubtitle: "TIMELESS LESSONS ON WEALTH, GREED, AND HAPPINESS",
    spinePublisher: "HH",
    spineDesign: "psychology-of-money",
    spineWidth: 22,
    cover: "/books/psychology-of-money.jpg",
    coverWidth: 318,
    coverHeight: 500,
    spineColor: "#eeeae0",
    spineInk: "#22201e",
    url: "https://www.harriman-house.com/psychologyofmoney",
  },
  {
    title: "SuperFreakonomics",
    spineTitle: "SUPERFREAKONOMICS",
    author: "Steven D. Levitt and Stephen J. Dubner",
    spineAuthor: "LEVITT & DUBNER",
    spineSubtitle: "GLOBAL COOLING, PATRIOTIC PROSTITUTES, AND WHY SUICIDE BOMBERS SHOULD BUY LIFE INSURANCE",
    spinePublisher: "WILLIAM MORROW",
    spineDesign: "superfreakonomics",
    spineWidth: 27,
    cover: "/books/superfreakonomics.jpg",
    coverWidth: 330,
    coverHeight: 500,
    spineColor: "#f6f5ef",
    spineInk: "#0863a0",
    url: "https://www.harpercollins.com/products/superfreakonomics-steven-d-levittstephen-j-dubner",
  },
  {
    title: "Decode and Conquer",
    spineTitle: "DECODE AND CONQUER",
    author: "Lewis C. Lin",
    spineAuthor: "LEWIS C. LIN",
    spineSubtitle: "FIFTH EDITION",
    spinePublisher: "IMPACT INTERVIEW",
    spineDesign: "decode-and-conquer",
    spineWidth: 31,
    cover: "/books/decode-and-conquer.webp",
    coverWidth: 1000,
    coverHeight: 1430,
    spineColor: "#f8f7f1",
    spineInk: "#242422",
    url: "https://www.lewis-lin.com/decode-and-conquer/",
  },
  {
    title: "The Financial Crisis and the Free Market Cure",
    spineTitle: "THE FINANCIAL CRISIS AND THE FREE MARKET CURE",
    author: "John A. Allison",
    spineAuthor: "JOHN A. ALLISON",
    spineSubtitle: "WHY PURE CAPITALISM IS THE WORLD ECONOMY'S ONLY HOPE",
    spinePublisher: "McGRAW HILL",
    spineDesign: "financial-crisis",
    spineWidth: 30,
    cover: "/books/financial-crisis-free-market-cure.jpg",
    coverWidth: 334,
    coverHeight: 500,
    spineColor: "#111212",
    spineInk: "#f4f1e8",
    url: "https://www.mheducation.com/highered/mhp/product/financial-crisis-free-market-cure-why-pure-capitalism-world-economy-s-only-hope.html",
  },
  {
    title: "Thinking, Fast and Slow",
    spineTitle: "THINKING, FAST AND SLOW",
    author: "Daniel Kahneman",
    spineAuthor: "DANIEL KAHNEMAN",
    spineSubtitle: "WINNER OF THE NOBEL PRIZE IN ECONOMICS",
    spinePublisher: "FSG",
    spineDesign: "thinking-fast-slow",
    spineWidth: 27,
    cover: "/books/thinking-fast-and-slow.jpg",
    coverWidth: 337,
    coverHeight: 500,
    spineColor: "#f5f3eb",
    spineInk: "#171716",
    url: "https://us.macmillan.com/books/9780374275631/thinkingfastandslow/",
  },
];

export default function Bookshelf() {
  const [open, setOpen] = useState(0);
  const controls = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedBook = books[open];

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number | null = null;
    if (event.key === "ArrowLeft") next = (index - 1 + books.length) % books.length;
    if (event.key === "ArrowRight") next = (index + 1) % books.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = books.length - 1;
    if (next === null) return;

    event.preventDefault();
    setOpen(next);
    controls.current[next]?.focus();
  };

  return (
    <section className="about-bookshelf" aria-labelledby="bookshelf-title">
      <div className="about-bookshelf-head">
        <h2 className="about-block-label" id="bookshelf-title">On my shelf</h2>
        <p>Choose a spine to pull a book forward.</p>
      </div>

      <div className="bookshelf-viewport">
        <ul className="bookshelf-list" aria-label="Bookshelf">
          {books.map((book, index) => {
            const isOpen = index === open;
            const leanStep = (index % 3) * 0.12;
            const lean = index % 2 === 0 ? 0.45 + leanStep : -0.45 - leanStep;
            return (
              <li
                className="bookshelf-book"
                data-open={isOpen ? "" : undefined}
                key={book.title}
                style={
                  {
                    "--book-ratio": book.coverWidth / book.coverHeight,
                    "--book-lean": `${lean}deg`,
                    "--spine-width": `calc(${book.spineWidth}px * var(--shelf-scale))`,
                    "--spine-color": book.spineColor,
                    "--spine-ink": book.spineInk,
                  } as CSSProperties
                }
              >
                <button
                  className="bookshelf-trigger"
                  type="button"
                  ref={(node) => { controls.current[index] = node; }}
                  aria-pressed={isOpen}
                  aria-label={`${book.title} by ${book.author}${isOpen ? ", currently shown" : ", select"}`}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => setOpen(index)}
                  onKeyDown={(event) => onKeyDown(event, index)}
                >
                  <span className="bookshelf-book-inner">
                    <span className="bookshelf-cover">
                      <Image
                        src={book.cover}
                        alt=""
                        width={book.coverWidth}
                        height={book.coverHeight}
                        sizes="150px"
                      />
                    </span>
                    <span className={`bookshelf-spine bookshelf-spine--${book.spineDesign}`}>
                      <span className="bookshelf-spine-head" aria-hidden="true" />
                      <span className="bookshelf-spine-title">{book.spineTitle}</span>
                      {book.spineSubtitle ? (
                        <span className="bookshelf-spine-subtitle">{book.spineSubtitle}</span>
                      ) : null}
                      <span className="bookshelf-spine-author">{book.spineAuthor}</span>
                      <span className="bookshelf-spine-publisher" aria-hidden="true">
                        {book.spinePublisher}
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <span className="bookshelf-plank" aria-hidden="true" />
      </div>

      <a
        className="bookshelf-annotation"
        href={selectedBook.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{selectedBook.title}</span>
        <span className="bookshelf-annotation-author">{selectedBook.author}</span>
        <span aria-hidden="true">↗</span>
      </a>
    </section>
  );
}
