//@ts-check
class IpsManager {
    constructor() {
        this.day = new Date().getDate();
        this.ipsToday = [];
        this.MAX_PAGES = 500;
    }
    add(ip) {
        this.ipsToday[ip] = this.ipsToday[ip] ?? { pages: 1 };
    }
    getDay() {
        return this.day;
    }
    validQuota(ip) {
        return this.ipsToday[ip].pages > this.MAX_PAGES;
    }
    renewDay() {
        this.ipsToday = this.day !== new Date().getDate() ? [] : this.ipsToday;
    }
    getIpData(ip) {
        return this.ipsToday[ip];
    }
    incrementIpPages(ip, pages) {
        this.ipsToday[ip].pages += parseInt(pages);
    }
}

export default IpsManager;
