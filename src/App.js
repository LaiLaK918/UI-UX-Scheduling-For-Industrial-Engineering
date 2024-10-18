import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiHome,
  FiSettings,
  FiHelpCircle,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
} from "react-icons/fi";
import { AiOutlineFilter, AiOutlineSearch } from "react-icons/ai";
import { BiSortAlt2 } from "react-icons/bi";
import Papa from "papaparse";
import GanttChart from "./GanttChart";

const DataProcessingInterface = () => {
  const [files, setFiles] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [processedData, setProcessedData] = useState([]);
  const [calculatedParameters, setCalculatedParameters] = useState([]);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [isAlgorithmDropdownOpen, setIsAlgorithmDropdownOpen] = useState(false);
  const [columns, setColumns] = useState([]);
  const [newRowData, setNewRowData] = useState({});

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    // Process CSV files
    acceptedFiles.forEach((file) => {
      Papa.parse(file, {
        complete: (result) => {
          setTableData(result.data);
          setColumns(Object.keys(result.data[0]));
          setNewRowData(
            Object.fromEntries(
              Object.keys(result.data[0]).map((key) => [key, ""])
            )
          );
        },
        header: true,
        skipEmptyLines: true,
      });
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
  });

  const algorithms = [
    {
      id: 1,
      name: "FSFC (First-Come, First-Served)",
      description: "Xử lý công việc theo thứ tự đến trước",
    },
    {
      id: 2,
      name: "LSFS (Last-Come, First-Served)",
      description: "Xử lý công việc theo thứ tự đến sau",
    },
    {
      id: 3,
      name: "SPT (Shortest Processing Time)",
      description: "Xử lý công việc có thời gian ngắn nhất trước",
    },
    {
      id: 4,
      name: "LPT (Longest Processing Time)",
      description: "Xử lý công việc có thời gian dài nhất trước",
    },
    {
      id: 5,
      name: "WSPT (Weighted Shortest Processing Time)",
      description: "Xử lý công việc theo thời gian ngắn nhất có trọng số",
    },
    {
      id: 6,
      name: "WI (Weighted Index)",
      description: "Xử lý công việc theo chỉ số trọng số",
    },
    {
      id: 7,
      name: "EDD (Earliest Due Date)",
      description: "Xử lý công việc có thời hạn sớm nhất",
    },
    {
      id: 8,
      name: "ERD (Earliest Release Date)",
      description: "Xử lý công việc có thời gian phát hành sớm nhất",
    },
  ];

  const selectAlgorithm = (algorithmId) => {
    setSelectedAlgorithm(algorithmId);
    setIsAlgorithmDropdownOpen(false);
  };

  useEffect(() => {
    if (isAnalyzed && selectedAlgorithm && tableData.length > 0) {
      // Process data based on selected algorithm
      const processed = tableData.map((row, index) => ({
        "Công việc": row["Công việc"],
        "Thời gian bắt đầu": calculateStartTime(index),
        "Thời gian gia công": parseInt(row["Thời gian gia công"]),
        "Thời gian hoàn thành": calculateCompletionTime(index),
        "Thời gian trễ": calculateLateness(index),
      }));
      setProcessedData(processed);
    }
  }, [isAnalyzed, selectedAlgorithm, tableData]);

  const calculateStartTime = (index) => {
    if (index === 0) return 0;
    const prevJob = processedData[index - 1];
    return prevJob["Thời gian hoàn thành"];
  };

  const calculateCompletionTime = (index) => {
    const startTime = calculateStartTime(index);
    return startTime + parseInt(tableData[index]["Thời gian gia công"]);
  };

  const calculateLateness = (index) => {
    const completionTime = calculateCompletionTime(index);
    const dueTime = parseInt(tableData[index]["Thời gian tới hạn"]);
    return Math.max(0, completionTime - dueTime);
  };

  // Hàm cho từng giải thuật
  const fsfc = () => {
    console.log("Kết quả FSFC");
  };

  const lsfs = () => {
    console.log("Kết quả LSFS");
  };

  const spt = () => {
    console.log("Kết quả SPT");
  };

  const lpt = () => {
    console.log("Kết quả LPT");
  };

  const wspt = () => {
    // Chuẩn bị dữ liệu cho việc tính toán WSPT
    const df = tableData.map((row) => ({
      "Công việc": row["Công việc"],
      "Thời gian gia công": parseInt(row["Thời gian gia công"]),
      "Trọng số": parseFloat(row["Trọng số"]),
      "Due date": parseInt(row["Due date"]),
    }));

    // Gọi hàm wspt_schedule để tính toán điều độ công việc
    const schedule = wspt_schedule(df);
    setProcessedData(schedule);

    // Gọi hàm calculate_parameters để tính các thông số liên quan
    const parameters = calculate_parameters(df);
    setCalculatedParameters(parameters); // Lưu kết quả các thông số vào state để hiển thị
  };

  // Hàm tính toán wspt_schedule
  const wspt_schedule = (df) => {
    df.forEach((row) => {
      row["p/w"] = row["Thời gian gia công"] / row["Trọng số"];
    });
    df.sort((a, b) => a["p/w"] - b["p/w"]); // Sắp xếp công việc theo p/w tăng dần

    let start_time = 0;
    const schedule = [];

    df.forEach((row) => {
      const job = row["Công việc"];
      const processing_time = row["Thời gian gia công"];
      const due_date = row["Due date"];

      const completion_time = start_time + processing_time;
      const lateness = completion_time - due_date; // Tính độ trễ

      schedule.push({
        "Công việc": job,
        "Thời gian bắt đầu": start_time,
        "Thời gian gia công": processing_time,
        "Thời gian hoàn thành": completion_time,
        "Thời gian trễ": lateness > 0 ? lateness : 0,
      });

      start_time = completion_time; // Cập nhật thời gian bắt đầu công việc tiếp theo
    });

    return schedule;
  };

  // Hàm tính các thông số liên quan dựa trên luật WSPT
  const calculate_parameters = (df) => {
    df.forEach((row) => {
      row["p/w"] = row["Thời gian gia công"] / row["Trọng số"];
    });
    df.sort((a, b) => a["p/w"] - b["p/w"]); // Sắp xếp theo p/w tăng dần

    let start_time = 0;
    let total_weighted_completion_time = 0;
    let total_completion_time = 0;
    let total_processing_time = 0;
    let total_lateness = 0;
    let delayed_jobs_count = 0;

    const n = df.length;

    df.forEach((row) => {
      const processing_time = row["Thời gian gia công"];
      const weight = row["Trọng số"];
      const due_date = row["Due date"];

      const completion_time = start_time + processing_time;
      const lateness = completion_time - due_date;
      const weighted_completion_time = completion_time * weight;
      total_weighted_completion_time += weighted_completion_time;
      total_completion_time += completion_time;
      total_processing_time += processing_time;
      total_lateness += lateness > 0 ? lateness : 0;

      if (lateness > 0) {
        delayed_jobs_count += 1;
      }

      start_time = completion_time;
    });

    // Tính các thông số
    const average_completion_time = total_completion_time / n;
    const utilization = (total_processing_time / total_completion_time) * 100;
    const average_jobs_in_system =
      total_completion_time / total_processing_time;
    const average_lateness = total_lateness / n;

    const parameters = [
      {
        "Thông số": "Giá trị hàm mục tiêu",
        "Giá trị": total_weighted_completion_time,
      },
      {
        "Thông số": "Tổng thời gian hoàn thành các công việc",
        "Giá trị": total_completion_time,
      },
      {
        "Thông số": "Thời gian hoàn thành trung bình",
        "Giá trị": average_completion_time,
      },
      { "Thông số": "Độ hữu dụng", "Giá trị": utilization },
      {
        "Thông số": "Số lượng công việc trung bình trong hệ thống",
        "Giá trị": average_jobs_in_system,
      },
      { "Thông số": "Độ trễ trung bình", "Giá trị": average_lateness },
      {
        "Thông số": "Số lượng công việc bị trễ",
        "Giá trị": delayed_jobs_count,
      },
    ];

    return parameters;
  };

  const wi = () => {
    console.log("Kết quả WI");
  };

  const edd = () => {
    console.log("Kết quả EDD");
  };

  const erd = () => {
    console.log("Kết quả ERD");
  };

  const handleAnalyzeData = () => {
    setIsAnalyzed(true);
  };

  const handleGenerateReport = () => {
    if (selectedAlgorithm) {
      switch (selectedAlgorithm) {
        case 1:
          fsfc();
          break;
        case 2:
          lsfs();
          break;
        case 3:
          spt();
          break;
        case 4:
          lpt();
          break;
        case 5:
          wspt();
          break;
        case 6:
          wi();
          break;
        case 7:
          edd();
          break;
        case 8:
          erd();
          break;
        default:
          break;
      }
    }
  };

  const handleInputChange = (column, value) => {
    setNewRowData((prev) => ({ ...prev, [column]: value }));
  };

  const handleAddNewRow = () => {
    setTableData((prev) => [...prev, newRowData]);
    setNewRowData(Object.fromEntries(columns.map((key) => [key, ""])));
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-2xl font-semibold mb-4">Dữ liệu gốc</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      {columns.map((column, index) => (
                        <th key={index} className="p-2 text-left">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        {columns.map((column, colIndex) => (
                          <td key={colIndex} className="p-2">
                            {row[column]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="col-span-1 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  Điều độ công việc
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left">Công việc</th>
                        <th className="p-2 text-left">Thời gian bắt đầu</th>
                        <th className="p-2 text-left">Thời gian gia công</th>
                        <th className="p-2 text-left">Thời gian hoàn thành</th>
                        <th className="p-2 text-left">Thời gian trễ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedData.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{row["Công việc"]}</td>
                          <td className="p-2">{row["Thời gian bắt đầu"]}</td>
                          <td className="p-2">{row["Thời gian gia công"]}</td>
                          <td className="p-2">{row["Thời gian hoàn thành"]}</td>
                          <td className="p-2">{row["Thời gian trễ"]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-4">Hàm mục tiêu</h2>
                {/* Hiển thị biểu đồ Gantt */}
                <GanttChart data={processedData} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-3">
              <h2 className="text-2xl font-semibold mb-4">
                Thông số liên quan
              </h2>
              <div className="w-full">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left w-auto">Thông số</th>{" "}
                      {/* Cột này sẽ co theo nội dung dài nhất */}
                      <th className="p-2 text-left">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculatedParameters.map((param, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 whitespace-nowrap w-auto">
                          {param["Thông số"]}
                        </td>{" "}
                        {/* Điều chỉnh độ rộng tự động */}
                        <td className="p-2">{param["Giá trị"]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold mb-4">Thao tác nhanh</h2>
              <div className="flex space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  onClick={handleAnalyzeData}
                >
                  Phân tích dữ liệu
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  onClick={handleGenerateReport}
                >
                  Tạo báo cáo
                </button>
                <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors">
                  Xuất kết quả
                </button>
              </div>
            </div>
          </div>
        );
      case "upload":
        return (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Tải lên tệp CSV</h2>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-500"
              }`}
            >
              <input {...getInputProps()} />
              <FiUploadCloud className="text-4xl mb-4 mx-auto text-gray-400" />
              <p className="text-gray-600">
                {isDragActive
                  ? "Thả tệp CSV vào đây"
                  : "Kéo và thả tệp CSV vào đây, hoặc nhấp để chọn tệp"}
              </p>
            </div>
            {files.length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Tệp đã tải lên:</h2>
                <ul className="space-y-2">
                  {files.map((file) => (
                    <li
                      key={file.name}
                      className="flex items-center bg-gray-100 rounded-md p-2"
                    >
                      <FiFile className="mr-2 text-gray-500" />
                      <span className="flex-grow">{file.name}</span>
                      <button
                        onClick={() =>
                          setFiles((prev) => prev.filter((f) => f !== file))
                        }
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiX />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800">Xử lý dữ liệu</h1>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <button
                onClick={() => setActiveTab("home")}
                className={`w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 ${
                  activeTab === "home" ? "bg-gray-100" : ""
                }`}
              >
                <FiHome className="mr-2" /> Trang chủ
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab("upload")}
                className={`w-full flex items-center px-4 py-2 text-gray-600 hover:bg-gray-100 ${
                  activeTab === "upload" ? "bg-gray-100" : ""
                }`}
              >
                <FiUploadCloud className="mr-2" /> Tải lên CSV
              </button>
            </li>
            <li>
              <div className="relative">
                <button
                  onClick={() =>
                    setIsAlgorithmDropdownOpen(!isAlgorithmDropdownOpen)
                  }
                  className={`w-full flex items-center justify-between px-4 py-2 text-gray-600 hover:bg-gray-100 ${
                    isAlgorithmDropdownOpen ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="flex items-center">
                    <FiSettings className="mr-2" /> Thuật toán
                  </span>
                  {isAlgorithmDropdownOpen ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </button>
                {isAlgorithmDropdownOpen && (
                  <div className="bg-white shadow-md rounded-md mt-2 py-2">
                    {algorithms.map((algorithm) => (
                      <div
                        key={algorithm.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectAlgorithm(algorithm.id)}
                      >
                        <input
                          type="radio"
                          id={`algorithm-${algorithm.id}`}
                          checked={selectedAlgorithm === algorithm.id}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        <label htmlFor={`algorithm-${algorithm.id}`}>
                          {algorithm.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </li>
          </ul>
        </nav>
        {selectedAlgorithm && (
          <div className="mt-4 p-4 bg-blue-100 rounded-md mx-4">
            <h3 className="font-semibold mb-2">Thuật toán đã chọn:</h3>
            <p>{algorithms.find((a) => a.id === selectedAlgorithm)?.name}</p>
          </div>
        )}
        {columns.length > 0 && (
          <div className="mt-4 p-4 bg-green-100 rounded-md mx-4">
            <h3 className="font-semibold mb-2">Thêm dữ liệu mới:</h3>
            {columns.map((column, index) => (
              <div key={index} className="mb-2">
                <label
                  htmlFor={`new-${column}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  {column}
                </label>
                <input
                  type="text"
                  id={`new-${column}`}
                  value={newRowData[column]}
                  onChange={(e) => handleInputChange(column, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            ))}
            <button
              onClick={handleAddNewRow}
              className="mt-2 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <FiPlus className="mr-2" /> Thêm dòng mới
            </button>
          </div>
        )}
      </div>
      <div className="flex-grow p-8">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </div>
    </div>
  );
};

export default DataProcessingInterface;
