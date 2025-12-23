import { useState, useEffect, useCallback } from 'react'
import { convertTextToISL, buildStaticUrl, checkHealth, APIError } from './services/api'
import { useSpeechRecognition } from './hooks/useSpeechRecognition'

function App() {
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isBackendConnected, setIsBackendConnected] = useState(null)

  // Process text through the API
  const processText = useCallback(async (inputText) => {
    if (!inputText?.trim()) return

    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await convertTextToISL(inputText)
      setResult(data)
      setCurrentImageIndex(0)
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
      console.error('Error processing text:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Speech recognition hook
  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'en-US',
    onResult: (transcript) => {
      setText(transcript)
      processText(transcript)
    },
    onError: (errorMessage) => {
      setError(`Speech recognition error: ${errorMessage}`)
    },
  })

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await checkHealth()
        setIsBackendConnected(true)
      } catch {
        setIsBackendConnected(false)
      }
    }
    checkBackend()
  }, [])

  // Slideshow effect for letter sequence
  useEffect(() => {
    let interval
    if (result?.type === 'sequence' && result.data.length > 0) {
      if (currentImageIndex < result.data.length - 1) {
        interval = setInterval(() => {
          setCurrentImageIndex((prev) => prev + 1)
        }, 200)
      }
    }
    return () => clearInterval(interval)
  }, [result, currentImageIndex])

  const handleSubmit = (e) => {
    e.preventDefault()
    processText(text)
  }

  const handleMicClick = () => {
    setError('')
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 relative overflow-hidden font-['Outfit'] selection:bg-purple-500 selection:text-white">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px]" />

      <div className="w-full max-w-4xl flex flex-col items-center gap-6 relative z-10">

        {/* Connection Status Badge */}
        {isBackendConnected !== null && (
          <div className={`fixed top-4 right-4 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${
            isBackendConnected 
              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isBackendConnected ? 'API Connected' : 'API Offline'}
          </div>
        )}

        {/* Main Converter Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full overflow-hidden border border-white/20 transition-all hover:shadow-purple-500/10">
          <div className="p-8 md:p-10">
            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Audio to ISL
              </h1>
              <p className="text-gray-500 font-medium">Identify. Translate. Communicate.</p>
            </header>

            {/* Input & Controls */}
            <form onSubmit={handleSubmit} className="mb-8">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative bg-white rounded-xl flex items-start gap-2 shadow-inner p-2 border border-gray-100">
                  <textarea
                    className="w-full bg-transparent rounded-lg p-3 text-lg text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none min-h-[100px]"
                    placeholder="Type words here or click the mic to speak..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex flex-col gap-2 p-1">
                    <button
                      type="button"
                      onClick={handleMicClick}
                      disabled={!isSpeechSupported || isLoading}
                      className={`p-3 rounded-xl transition-all duration-300 shadow-sm ${
                        !isSpeechSupported 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : isListening
                            ? 'bg-red-500 text-white animate-pulse shadow-red-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600'
                      }`}
                      title={!isSpeechSupported ? 'Speech recognition not supported' : 'Toggle Microphone'}
                    >
                      {isListening ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !text.trim()}
                      className={`p-3 rounded-xl shadow-lg transition-all duration-200 ${
                        isLoading || !text.trim()
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:shadow-purple-500/30 hover:scale-105 active:scale-95'
                      }`}
                      title="Convert"
                    >
                      {isLoading ? (
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {error && (
              <div className="mb-6 p-4 bg-red-50/50 border border-red-200/50 rounded-xl text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Output Viewport */}
            <div className="min-h-[400px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 relative overflow-hidden">
              {result ? (
                <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                  {result.type === 'gif' ? (
                    <div className="relative group">
                      <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 group-hover:opacity-30 blur-lg transition duration-500"></div>
                      <img
                        src={buildStaticUrl(result.src)}
                        alt={result.alt}
                        className="relative max-h-[350px] w-full object-contain rounded-xl shadow-sm z-10"
                      />
                      <div className="mt-4 text-center">
                        <span className="inline-block px-4 py-1 bg-white border border-gray-100 rounded-full text-gray-600 font-medium text-sm shadow-sm capitalize">
                          {result.alt}
                        </span>
                      </div>
                    </div>
                  ) : result.type === 'sequence' && result.data.length > 0 ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="relative w-full max-w-sm aspect-square bg-white rounded-2xl shadow-lg border border-gray-100 p-2 transform rotate-1 transition-transform">
                        <img
                          src={buildStaticUrl(result.data[currentImageIndex])}
                          alt="Sign Language Letter"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>

                      <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="text-4xl font-bold text-gray-800 bg-white/80 backdrop-blur px-8 py-3 rounded-2xl shadow-sm border border-white/50 min-w-[120px] text-center">
                          {result.original_text[currentImageIndex]?.toUpperCase()}
                        </div>
                        <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 transition-all duration-200"
                            style={{ width: `${((currentImageIndex + 1) / result.data.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p>No valid sign language data found.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center max-w-sm">
                  <div className="bg-white p-6 rounded-full inline-flex items-center justify-center shadow-sm mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to Translate</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Your converted sign language animations will be displayed here in high quality.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-center shadow-xl">
          <p className="text-blue-100/80 text-sm leading-relaxed mb-4 font-light">
            <strong className="text-white font-medium">Audio to ISL</strong> bridges communication gaps using advanced processing to convert speech & text into seamless Sign Language animations.
          </p>
          <a
            href="https://github.com/koushikbethu/Aud-ISL-Convo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium transition-all group"
          >
            <svg className="w-5 h-5 opacity-80 group-hover:opacity-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
            </svg>
            <span>Star on GitHub</span>
          </a>
        </div>

      </div>

      {/* Scroll Hint Button */}
      <button
        onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full shadow-lg hover:bg-white/20 transition-all cursor-pointer animate-bounce z-50 items-center gap-2 group hidden md:flex"
      >
        <span className="font-medium tracking-wide">Scroll for GitHub</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  )
}

export default App
