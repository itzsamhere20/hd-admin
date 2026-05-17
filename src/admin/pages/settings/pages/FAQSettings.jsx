import { useState } from "react";
import SettingsLayout from "../components/SettingsLayout";

const FAQSettings = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  return (
    <SettingsLayout
      title="FAQ Management"
      description="Manage frequently asked questions for customers"
    >
      <div className="space-y-5">
        <input
          type="text"
          placeholder="FAQ Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="
            w-full h-[56px]
            rounded-2xl
            px-5
            bg-[#faf7f2]
            border border-[#e7dcc7]
            outline-none
          "
        />

        <textarea
          placeholder="FAQ Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="
            w-full min-h-[180px]
            rounded-2xl
            p-5
            bg-[#faf7f2]
            border border-[#e7dcc7]
            outline-none
            resize-none
          "
        />

        <button
          className="
            h-[56px]
            px-8
            rounded-2xl
            bg-primary
            text-white
          "
        >
          Add FAQ
        </button>
      </div>
    </SettingsLayout>
  );
};

export default FAQSettings;
