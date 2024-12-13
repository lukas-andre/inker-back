export class FCMPayloadUtil {
    /**
     * Convierte cualquier objeto en un objeto compatible con FCM donde todos los valores son strings
     */
    static sanitizeData(data: Record<string, any> = {}): Record<string, string> {
        return Object.entries(data).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: this.valueToString(value)
        }), {});
    }

    private static valueToString(value: any): string {
        if (value === null || value === undefined) {
            return '';
        }

        if (typeof value === 'string') {
            return value;
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
            return value.toString();
        }

        // Para objetos y arrays, usamos JSON.stringify
        return JSON.stringify(value);
    }

    /**
     * Convierte strings FCM de vuelta a sus tipos originales
     */
    static parseFCMData(data: Record<string, string>): Record<string, any> {
        return Object.entries(data).reduce((acc, [key, value]) => ({
            ...acc,
            [key]: this.parseValue(value)
        }), {});
    }

    private static parseValue(value: string): any {
        if (!value) return null;

        try {
            // Intenta parsear como JSON
            return JSON.parse(value);
        } catch {
            // Si falla el parse, devuelve el string original
            return value;
        }
    }
}
