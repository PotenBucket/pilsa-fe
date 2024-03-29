"use client";
import { useState, useEffect } from "react";
import WithHeaderLayout from "@/components/WithHeaderLayout";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import BottomSheet from "@/components/BottomSheet";
import Modal from "@/components/Modal";

// 달력
import {
  format,
  addMonths,
  addWeeks,
  addDays,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isWithinInterval,
  isSameDay,
  differenceInDays,
} from "date-fns";

interface ICategorieyList {
  categories: ICategoryItem[];
}
interface ICategoryItem {
  categoryCd: number;
  categoryName: string;
  description: string;
}

const ChallengePage = () => {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<any>([]);
  const accessToken =
    typeof window !== "undefined" && localStorage.getItem("accessToken");
  const [categoryList, setCategoryList] = useState<any>([]);

  const [isCustomSelecting, setIsCustomSelecting] = useState<boolean>(false);
  const [selectedInterval, setSelectedInterval] = useState<String>("");

  const dueDate = [
    { label: "1주", interval: "1week" },
    { label: "2주", interval: "2week" },
    { label: "30일", interval: "30days" },
    { label: "직접설정", interval: "self" },
  ];
  const [step, setStep] = useState(1);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/v1/pilsa/category`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        const categories = res.data.categories; // "categories" 키에서 배열을 추출
        setCategoryList(categories);
      })
      .catch((error) => {
        console.log("!", error);
      });
  }, []);

  const handleCategoryClick = (category: number) => {
    // 클릭한 항목이 이미 선택되었다면 제거, 아니면 추가
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((item: number) => item !== category)
      );
    } else {
      if (selectedCategories.length < 3) {
        setSelectedCategories([...selectedCategories, category]);
      }
    }
  };

  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    if (isCustomSelecting) {
      if (!startDate) {
        setStartDate(date);
        setEndDate(null);
      } else if (!endDate && date >= startDate) {
        setEndDate(date);
      } else {
        setStartDate(date);
        setEndDate(null);
      }

      if (startDate && endDate) {
        const daysDiff = differenceInDays(endDate, startDate) + 1;
        console.log("Selected days: ", daysDiff);
      }
    }
  };

  const isWithinSelectedRange = (date: Date) => {
    if (!startDate || !endDate) return false;
    return (
      isSameDay(date, startDate) ||
      isSameDay(date, endDate) ||
      (date > startDate && date < endDate)
    );
  };

  const handleIntervalClick = (interval: String) => {
    setSelectedInterval(interval);
    // 나머지 버튼의 선택 상태를 해제
    dueDate.forEach((d) => {
      if (d.interval !== interval) {
        document.getElementById(d.interval)?.classList.remove("bg-blue-200");
      }
    });
    switch (interval) {
      case "1week":
        // 1주 처리 로직
        const weekLater = addWeeks(new Date(), 1);
        setStartDate(new Date());
        setEndDate(weekLater);
        setIsCustomSelecting(false);
        break;
      case "2week":
        // 2주 처리 로직
        const twoWeeksLater = addWeeks(new Date(), 2);
        setStartDate(new Date());
        setEndDate(twoWeeksLater);
        setIsCustomSelecting(false);
        break;
      case "30days":
        // 30일 처리 로직
        const thirtyDaysLater = addDays(new Date(), 30);
        setStartDate(new Date());
        setEndDate(thirtyDaysLater);
        setIsCustomSelecting(false);
        break;
      case "self":
        setIsCustomSelecting(true);
        break;
      default:
        break;
    }
  };
  const renderCalendar = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({ start, end });

    return (
      <div className="rounded h-full w-full mt-3">
        <div className="flex justify-center items-center flex-grow-0 flex-shrink-0 w-[328px] relative gap-6 mb-3">
          <Image
            width={24}
            height={24}
            alt="back"
            src="/icons/ibtn_back.png"
            className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer"
            onClick={goToPreviousMonth}
          />

          <p className="flex-grow-0 flex-shrink-0 text-lg font-medium text-left text-[#353535]">
            {format(currentDate, "yyyy. M")}
          </p>

          <Image
            width={24}
            height={24}
            alt="back"
            src="/icons/ibtn_next.png"
            className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer"
            onClick={goToNextMonth}
          />
        </div>

        <div className="flex items-center justify-center grid grid-cols-7 m-3 px-3 py-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="flex items-center justify-center text-center text-[#b3b3b3] text-sm mb-3"
            >
              {day}
            </div>
          ))}
          {days.map((day) => (
            <div
              key={day.getTime()}
              onClick={() => handleDateClick(day)}
              className={`flex items-center justify-center text-center text-sm w-10 h-10 cursor-pointer mb-1 ${
                isSameMonth(day, currentDate) ? "" : "text-gray-400"
              } 
              ${
                isSameDay(day, startDate)
                  ? "bg-[#00c37d] text-[#fff] rounded-l-lg"
                  : ""
              } 
              ${
                isSameDay(day, endDate)
                  ? "bg-[#00c37d] text-[#fff] rounded-r-lg"
                  : ""
              }
              ${
                isWithinSelectedRange(day) &&
                !isSameDay(day, startDate) &&
                !isSameDay(day, endDate)
                  ? "bg-[#80e1be]"
                  : ""
              }
              `}
            >
              {format(day, "d")}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <WithHeaderLayout>
      <div
        className="flex flex-col h-full justify-between px-4"
        style={{ minHeight: "calc(100vh - 72px)" }}
      >
        <div>
          <div className="flex justify-between items-center w-[360px] h-14 px-4 py-3 border-t-0 border-r-0 border-b border-l-0 border-[#efefef]">
            <div className="flex justify-start items-center flex-grow relative gap-1">
              <Image
                width={24}
                height={24}
                alt="back"
                src="/icons/ibtn_back.png"
                className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer"
              />
              <p className="flex-grow-0 flex-shrink-0 text-base font-semibold text-left text-black">
                챌린지 만들기
              </p>
            </div>
          </div>
          <div className="mt-2 flex flex-col justify-start items-start gap-2 px-4">
            <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-0.5 py-0.5">
              <div className="flex-grow-0 flex-shrink-0 w-[108px] h-1 rounded-[90px] bg-[#00c37d]" />
              <div
                className={`flex-grow-0 flex-shrink-0 w-[108px] h-1 rounded-[90px] ${
                  step >= 2 ? "bg-[#00c37d]" : "bg-[#c4c4c4]"
                } `}
              />
              <div
                className={`flex-grow-0 flex-shrink-0 w-[108px] h-1 rounded-[90px] ${
                  step == 3 ? "bg-[#00c37d]" : "bg-[#c4c4c4]"
                } `}
              />
            </div>

            {/* step 1 */}
            <div
              className={`flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[328px] gap-2 ${
                step === 1 ? "" : "hidden"
              }`}
            >
              <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1.5 py-2">
                <p className="self-stretch flex-grow-0 flex-shrink-0 w-[328px] text-lg font-bold text-left text-[#353535]">
                  어떤 필사를 도전할까요?
                </p>
                <p className="self-stretch flex-grow-0 flex-shrink-0 w-[328px] text-xs text-left text-[#777]">
                  최대 3개까지 선택할 수 있어요
                </p>
              </div>
              <div className="flex justify-center items-start flex-grow-0 flex-shrink-0 w-[328px] gap-2 px-2 rounded-xl">
                <ul className="flex flex-wrap items-center justify-center gap-2.5 px-2">
                  {Object.entries<ICategoryItem>(categoryList).map(
                    ([key, category]) => (
                      <li
                        className={`px-3 py-1.5 border border-[#E3E3E3] rounded-[100px] cursor-pointer ${
                          selectedCategories.includes(category?.categoryCd)
                            ? "bg-[#00C37D]"
                            : ""
                        }`}
                        key={key}
                        onClick={() => handleCategoryClick(category.categoryCd)}
                      >
                        <span
                          className={`text-sm text-[#999] ${
                            selectedCategories.includes(category.categoryCd)
                              ? "text-white font-semibold"
                              : "font-light"
                          }`}
                        >
                          {category.categoryName}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
            {/* step 1 */}

            {/* step 2 */}
            <div
              className={`flex flex-col justify-start items-start flex-grow-0 flex-shrink-0 w-[328px] gap-2 ${
                step === 2 ? "" : "hidden"
              }`}
            >
              <div className="flex flex-col justify-center items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-1.5 py-2">
                <p className="self-stretch flex-grow-0 flex-shrink-0 w-[328px] text-lg font-bold text-left text-[#353535]">
                  얼마동안 챌린지 할까요 ?
                </p>
              </div>
              <div className="grid gap-1.5 grid-cols-2 grid-rows-2">
                {dueDate &&
                  dueDate.map((dueDate) => (
                    <div
                      onClick={() => handleIntervalClick(dueDate.interval)}
                      className={`flex justify-center items-center flex-grow-0 flex-shrink-0 w-40 h-[49px] relative gap-2.5 p-4 rounded-xl border border-[#e3e3e3] ${
                        selectedInterval === dueDate.interval
                          ? "bg-[#00C37D]"
                          : ""
                      }`}
                      id={dueDate.interval}
                      key={dueDate.interval}
                    >
                      <p
                        className={`flex-grow-0 flex-shrink-0 text-sm text-left  ${
                          selectedInterval === dueDate.interval
                            ? "text-[#fff]"
                            : "text-[#353535]"
                        }`}
                      >
                        {dueDate.label}
                      </p>
                    </div>
                  ))}
              </div>
              <div className="w-full">{renderCalendar()}</div>
            </div>
            {/* step 2 */}
          </div>
        </div>
        <div
          className={`flex items-end justify-end ${step === 1 ? "" : "hidden"}`}
        >
          <button
            type="submit"
            disabled={selectedCategories.length === 0}
            onClick={() => {
              setStep(2);
            }}
            className={`mt-5 mb-5 w-full py-4 rounded-lg text-white text-center ${
              selectedCategories.length === 0 ? "bg-[#E3E3E3]" : "bg-[#00C37D]"
            } text-sm font-bold`}
          >
            다음
          </button>
        </div>
      </div>
    </WithHeaderLayout>
  );
};
export default ChallengePage;
