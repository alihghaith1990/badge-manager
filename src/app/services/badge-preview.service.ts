import { Injectable } from '@angular/core';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import { ExtraBadge, Exhibitor } from '../models/exhibitor.model';
import { LogService } from '../services/log.service';
import { AuthService } from './auth.Service';

@Injectable({ providedIn: 'root' })
export class BadgePreviewService {

    constructor(
        private logs: LogService,
        private auth: AuthService
    ) { }

    getMaxForExhibitor(ex: Exhibitor): number {
        const space = ex.space ? parseInt(ex.space as any, 10) : null;
        if (!space) return 0;
        switch (true) {
            case (space <= 12): return 5;
            case (space <= 18): return 8;
            case (space <= 24): return 10;
            case (space <= 36): return 12;
            case (space <= 42): return 15;
            case (space <= 54): return 18;
            case (space >= 55): return 20;
            default: return 0;
        }
    }

    /** QR */
    private async createQR(data: any): Promise<string> {
        return QRCode.toDataURL(JSON.stringify(data), { width: 300 });
    }

    /** SHARP BARCODE (3x resolution → no blur) */
    private createSharpBarcode(id: string): string {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 180;

        JsBarcode(canvas, String(id), {
            format: 'CODE128',
            displayValue: false,
            height: 140,
            width: 3,
            margin: 0
        });

        return canvas.toDataURL('image/png');
    }

    /** Draw badge on A4 at fixed X=20, Y=36, but inner items centered */
    private async drawBadgeOnA4(pdf: jsPDF, ex: Exhibitor, b: ExtraBadge) {

        const qrData = {
            id: b.id,
            firstname: b.firstname,
            lastname: b.lastname,
            position: b.position,
            company: ex.companyname,
            country: ex.country
        };

        const qrImg = await this.createQR(qrData);
        const barcodeImg = this.createSharpBarcode(b.id);

        /** BADGE CONTAINER */
        const bx = 5;  // FIXED left (requested)
        const by = 60;  // FIXED top (requested)
        const bw = 90;  // badge width

        /** helper to center text inside container */
        const centerInside = (text: string, fontSize: number) => {
            pdf.setFontSize(fontSize);
            const w = pdf.getTextWidth(text);
            return bx + (bw - w) / 2;
        };

        let y = by;

        /** QR CODE (centered inside container) */
        const qrSize = 32;
        pdf.addImage(qrImg, "PNG", bx + (bw - qrSize) / 2, y, qrSize, qrSize);
        y += qrSize + 6;

        /** NAME */
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        const fullname = `${b.firstname} ${b.lastname}`;
        pdf.text(fullname, centerInside(fullname, 16), y);
        y += 8;

        /** POSITION */
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(12);
        if (b.position) {
            pdf.text(b.position, centerInside(b.position, 12), y);
            y += 7;
        }

        /** COMPANY */
        pdf.setFontSize(12);
        pdf.text(ex.companyname, centerInside(ex.companyname, 12), y);
        y += 7;

        /** COUNTRY */
        if (ex.country) {
            pdf.setFontSize(11);
            pdf.text(ex.country, centerInside(ex.country, 11), y);
            y += 10;
        }

        /** BARCODE (sharp & centered) */
        const bwImg = 45;
        const bhImg = 10;
        pdf.addImage(barcodeImg, "PNG", bx + (bw - bwImg) / 2, y, bwImg, bhImg);
        /** Barcode number below */
        y += bhImg + 3; // move a bit below the barcode
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.text(b.id, bx + bw / 2, y, { align: "center" });
    }

    /** PRINT ONE BADGE */
    async printBadge(ex: Exhibitor, b: ExtraBadge) {
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        await this.drawBadgeOnA4(pdf, ex, b);

        pdf.save(`${ex.companyname.replace(/\s+/g, '_')}_${b.id}.pdf`);

        this.logs.log({
            timestamp: new Date().toISOString(),
            user: this.auth.getCurrent()?.username ?? null,
            action: 'PRINT_BADGE',
            exhibitorId: ex.id,
            badgeId: b.id
        });
    }

    /** PRINT ALL BADGES (1 per A4 page) */
    async printAllBadgesForExhibitor(ex: Exhibitor) {
        const badges = ex.extrabadges ?? [];
        if (!badges.length) return alert('No badges to print');

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        for (let i = 0; i < badges.length; i++) {
            if (i > 0) pdf.addPage("a4", "portrait");
            await this.drawBadgeOnA4(pdf, ex, badges[i]);

            this.logs.log({
                timestamp: new Date().toISOString(),
                user: this.auth.getCurrent()?.username ?? null,
                action: 'EXPORT_PDF',
                exhibitorId: ex.id,
                badgeId: badges[i].id
            });
        }

        pdf.save(`${ex.companyname.replace(/\s+/g, '_')}_badges.pdf`);
    }
}
