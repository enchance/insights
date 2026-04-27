class UIPaths {
    // Auth
    login = '/login';
    logout = '/logout';
    register = '/register';

    // Insight
    insights = '/insights';
    createInsight = '/insights/create';
    insightDetail = (id: number | string) => `/insights/${id}`;
    updateInsight = (id: number | string) => `/insights/${id}/edit`;
}

const uipaths = new UIPaths();
export default uipaths;
