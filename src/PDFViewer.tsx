import React, {useCallback, useEffect, useRef, useState} from 'react';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.10.111/build/pdf.worker.min.js`;

interface PDFViewerProps {
    src: string; // Add a prop for the PDF source
}

const PDFViewer: React.FC<PDFViewerProps> = ({src = "./output.pdf"}) => {
    const [pdf, setPDF] = useState<pdfjs.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [scale, setScale] = useState(1);
    const [numPages, setNumPages] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const renderPage = useCallback(
        async ({pdfDoc, pageNum, scale}: { pdfDoc: pdfjs.PDFDocumentProxy, pageNum: number, scale: number }) => {
            if (canvasRef.current) {
                const page = await pdfDoc.getPage(pageNum);
                const ctx = canvasRef.current.getContext("2d");

                const viewport = page.getViewport({scale});

                canvasRef.current.width = viewport.width;
                canvasRef.current.height = viewport.height;

                page.render({
                    canvasContext: ctx!,
                    viewport: viewport,
                });
            }
        },
        []
    );

    const prevPage = () => {
        if (currentPage > 1 && pdf) {
            renderPage({pdfDoc: pdf, pageNum: currentPage - 1, scale}).then(r => console.log(r));
            setCurrentPage(currentPage - 1);
        }
    };

    const nextPage = () => {
        if (currentPage < numPages && pdf) {
            renderPage({pdfDoc: pdf, pageNum: currentPage + 1, scale}).then(r => console.log(r));
            setCurrentPage(currentPage + 1);
        }
    };

    const zoomOut = () => {
        if (pdf) {
            renderPage({pdfDoc: pdf, pageNum: currentPage, scale: scale - 0.1}).then(r => console.log(r));
            setScale(scale - 0.1);
        }
    };

    const zoomIn = () => {
        if (pdf) {
            renderPage({pdfDoc: pdf, pageNum: currentPage, scale: scale + 0.1}).then(r => console.log(r));
            setScale(scale + 0.1);
        }
    };

    useEffect(() => {
        const fetchPdf = async () => {
            const loadingTask = pdfjs.getDocument(src);

            const pdfDoc = await loadingTask.promise;

            setPDF(pdfDoc);

            setNumPages(pdfDoc._pdfInfo.numPages);

            await renderPage({pdfDoc, pageNum: 1, scale: 1});

            setLoaded(true);
        };

        fetchPdf().then(r => console.log(r));
    }, [renderPage, src]);

    return (
        <div className="container">
            {loaded ? (
                <div className="menu-bar">
                    <div className="title">Eloquent JavaScript</div>
                    <button onClick={prevPage}>
                        <i className="gg-play-track-prev"></i>
                    </button>
                    <button onClick={nextPage}>
                        <i className="gg-play-track-next"></i>
                    </button>
                    <div className="pagination">
                        Trang {currentPage} / {numPages}
                    </div>
                    <i className="gg-zoom-in" onClick={zoomIn}/>
                    <i className="gg-zoom-out" onClick={zoomOut}/>
                </div>
            ) : (
                <h2 style={{color: "#fff", textAlign: "center", fontSize: "40px"}}>Loading...</h2>
            )}
            <div className="canvas-container">
                <div>
                    <canvas ref={canvasRef}></canvas>
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
