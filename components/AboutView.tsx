
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HardDrive, Lock, Cpu, Eraser } from 'lucide-react';

const AboutView: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Is LegalShield AI free to use?",
      answer: "Yes. LegalShield AI is currently in 'Public Preview' as a technology demo. All features are completely free. No credit card information is required. While different licensing models may be introduced for enterprise API integrations in the future, individual use remains free."
    },
    {
      question: "Which type of documents works best?",
      answer: "LegalShield AI performs best with standard corporate legal documents such as Non-Disclosure Agreements (NDA), Service Level Agreements (SLA), Supplier Agreements, Lease Contracts, and Employment Contracts. It is optimized to detect termination clauses, indemnification obligations, and jurisdiction issues in these document types."
    },
    {
      question: "What happens if I upload a non-contract document (e.g. a Novel or Invoice)?",
      answer: "The system is conditioned to look for legal risk vectors (terminology). If you upload a recipe, novel, or invoice, the AI will either return 'No Risks Detected' or may hallucinate by trying to force irrelevant text into a legal context. For accurate results, please upload legal texts only."
    },
    {
      question: "Why do I only have 60 seconds?",
      answer: "In cybersecurity, the biggest vulnerability is 'time'. The longer sensitive data remains on a screen or server, the wider the attack surface. The 60-second rule (SEC-60S) is a radical security protocol designed to minimize data exposure time, making potential data leaks statistically near-impossible."
    },
    {
      question: "Are my contracts stored on your servers?",
      answer: "No, absolutely not. Under our 'Zero-Data Retention' (ZDR) policy, uploaded files are never written to disk. Processing occurs instantly in RAM (Volatile Memory) only. Once the session ends or the timer expires, data is cryptographically wiped and cannot be recovered."
    },
    {
      question: "Can I trust the AI analysis 100%?",
      answer: "No. LegalShield AI is a decision support system and cannot replace a lawyer. Even if the AI operates with 99% accuracy, the final legal judgment and signing authority must always remain with a human operator. Our system aims to reduce the 'Cognitive Load' on lawyers and highlight risks that might be overlooked."
    },
    {
      question: "Which file formats are supported?",
      answer: "We currently support only PDF files as they best preserve security and text processing standards. OCR support for image-based PDFs is limited in this version; text-based (Searchable) PDFs are recommended."
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 animate-fade-in font-sans text-legal-dark dark:text-gray-200">
      
      {/* 1. Header */}
      <div className="mb-16 pt-8 border-b border-legal-primary/10 dark:border-gray-800 pb-8">
        <div className="mb-4 text-legal-accent">
            <span className="text-xs font-bold tracking-widest uppercase">Legal Technology Doctrine</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-legal-primary dark:text-legal-light tracking-tight mb-6">
          Technical Manifesto & <br/> Security Architecture
        </h1>
        <p className="text-lg text-legal-dark/70 dark:text-gray-400 font-light leading-relaxed max-w-3xl">
          Legal confidentiality is absolute. LegalShield AI is an open-source, transparent analysis engine built on the "Zero-Data Retention" principle. Below, we transparently explain the journey of your data and our security layers.
        </p>
      </div>

      {/* 2. Vision (Quote) */}
      <div className="mb-24">
        <div className="bg-legal-primary/5 dark:bg-legal-primary/20 border-l-4 border-legal-primary p-8 rounded-r-lg">
          <p className="text-xl md:text-2xl text-legal-primary dark:text-legal-light font-serif italic leading-relaxed">
            "The absolute way to protect data is not to own it. We do not store files; we read and forget."
          </p>
          <p className="text-sm text-legal-dark/40 dark:text-gray-500 mt-4 uppercase tracking-widest font-bold">
            — Our Doctrine
          </p>
        </div>
      </div>

      {/* 3. The Lifecycle */}
      <div className="mb-24">
         <div className="mb-12">
          <h2 className="text-2xl font-bold text-legal-dark dark:text-white">
            The Lifecycle
          </h2>
        </div>

        <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 md:ml-6 space-y-12">
            
            {/* Step 1 */}
            <div className="relative pl-12">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-legal-primary border-4 border-white dark:border-legal-dark shadow-sm"></div>
                <h3 className="text-lg font-bold text-legal-dark dark:text-gray-200 mb-2">
                    01. Client-Side Masking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    As soon as the user uploads the PDF, and before it leaves the browser, our JavaScript engine engages. Regex algorithms detect Names, IDs, Amounts, and Emails, masking them with <code>[REDACTED_DATA]</code> tags. The data sent to the server is now anonymous.
                </p>
            </div>

            {/* Step 2 */}
            <div className="relative pl-12">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-legal-dark"></div>
                <h3 className="text-lg font-bold text-legal-dark dark:text-gray-200 mb-2">
                    02. TLS 1.3 Tunneling
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    The masked text is transmitted to Google's Enterprise LLM API via industry-standard TLS 1.3 encryption. This ensures full protection against "Man-in-the-Middle" attacks.
                </p>
            </div>

            {/* Step 3 */}
            <div className="relative pl-12">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-legal-dark"></div>
                <h3 className="text-lg font-bold text-legal-dark dark:text-gray-200 mb-2">
                    03. Ephemeral Inference
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    The AI model analyzes the text. This operation occurs in "Stateless" mode. Per Google's enterprise policy, data sent via API is not used for model training and is deleted from memory as soon as processing is complete.
                </p>
            </div>

            {/* Step 4 */}
            <div className="relative pl-12">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-legal-accent border-4 border-white dark:border-legal-dark shadow-sm"></div>
                <h3 className="text-lg font-bold text-legal-accent mb-2">
                    04. The Kill Switch
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    Results are displayed to the user. When the 60-second timer expires or the tab is closed, all variables in the browser memory are set to <code>null</code>, and the session token is invalidated. No digital footprint remains.
                </p>
            </div>

        </div>
      </div>

      {/* 4. Architecture Standards Grid */}
      <div className="mb-24">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-legal-dark dark:text-white">
            Architecture Standards
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <div className="group border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-legal-primary/30 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
            <div className="text-legal-primary dark:text-legal-light font-bold mb-3 text-lg flex items-center">
              <HardDrive className="w-5 h-5 mr-2" />
              Diskless Architecture
            </div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              The system has no persistent storage units (HDD/SSD). The database layer has been intentionally omitted from the architecture.
            </p>
          </div>

          <div className="group border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-legal-primary/30 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
            <div className="text-legal-primary dark:text-legal-light font-bold mb-3 text-lg flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Client-Side Encryption
            </div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              Encryption keys are stored in the user's session (Session Storage), not on the server, and vanish after 60 seconds.
            </p>
          </div>

          <div className="group border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-legal-primary/30 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
            <div className="text-legal-primary dark:text-legal-light font-bold mb-3 text-lg flex items-center">
              <Cpu className="w-5 h-5 mr-2" />
              TEE / Enclave Ready
            </div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              Our protocols are designed to be compatible with Trusted Execution Environments (hardware-based secure zones).
            </p>
          </div>

          <div className="group border border-gray-100 dark:border-gray-800 rounded-xl p-6 hover:border-legal-primary/30 transition-all bg-white dark:bg-gray-900 shadow-sm hover:shadow-md">
            <div className="text-legal-primary dark:text-legal-light font-bold mb-3 text-lg flex items-center">
              <Eraser className="w-5 h-5 mr-2" />
              Strict Wipe Protocol
            </div>
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              Memory cleaning is not left to the OS "Garbage Collector" but is performed via forced "Nullification".
            </p>
          </div>
        </div>
      </div>

      {/* 5. Compliance & Ethics */}
      <div className="mb-24 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl p-8 md:p-10">
         <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3">
                <h3 className="text-xl font-bold text-legal-dark dark:text-white mb-2">Legal Compliance & Ethics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">GDPR, KVKK, and Attorney Ethics framework positioning.</p>
            </div>
            <div className="md:w-2/3 space-y-6">
                <div>
                    <h4 className="font-bold text-legal-primary dark:text-legal-light text-sm uppercase tracking-wide mb-2">Data Processor Role</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        Under GDPR and KVKK, LegalShield AI acts solely as a temporary "Data Processor," not a "Data Controller." It claims no ownership over data, does not store it, and does not share it with third parties.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-legal-primary dark:text-legal-light text-sm uppercase tracking-wide mb-2">Attorney-Client Privilege</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        The system operates on a "Human-in-the-loop" principle. AI outputs are recommendations and do not replace the final judgment of a lawyer. Thus, it does not create a breach of professional liability.
                    </p>
                </div>
            </div>
         </div>
      </div>

      <hr className="border-gray-100 dark:border-gray-800 mb-16" />

      {/* 6. FAQ */}
      <div className="mb-12">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-legal-dark dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:border-gray-300 dark:hover:border-gray-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none group bg-white dark:bg-gray-900"
                >
                  <span className={`text-base font-medium transition-colors ${isOpen ? 'text-legal-accent' : 'text-legal-dark dark:text-gray-200 group-hover:text-legal-primary dark:group-hover:text-legal-light'}`}>
                    {item.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-legal-accent flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-legal-primary dark:group-hover:text-legal-light flex-shrink-0 ml-4 transition-colors" />
                  )}
                </button>
                
                <div 
                  className={`transition-all duration-300 ease-in-out bg-gray-50/50 dark:bg-gray-800/50 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="text-legal-dark/70 dark:text-gray-400 leading-relaxed text-sm p-5 pt-0 border-t border-gray-100 dark:border-gray-800 mt-4">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-12 mt-12 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 font-mono border-t border-gray-100 dark:border-gray-800">
        <div className="mb-4 md:mb-0">
             <span>Open Source Initiative</span>
        </div>
        <div className="inline-flex items-center px-3 py-1 bg-green-50 dark:bg-green-900/30 rounded border border-green-100 dark:border-green-900/50">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
          <p className="text-green-700 dark:text-green-400 font-medium">
            System Status: OPERATIONAL // ZDR PROTOCOL: ACTIVE
          </p>
        </div>
      </div>

    </div>
  );
};

export default AboutView;
