/**
 * Holds profile information for a user, including financial goals.
 */
class UserProfile {
    constructor(userId, jobTitle, monthlySalary) {
        this.userId = userId;
        this.jobTitle = jobTitle;
        this.monthlySalary = monthlySalary;
    }

    getMonthlySavingsGoalAmount() {
        // Placeholder: if needed by ReportGenerator
        return 0;
    }
}

module.exports = UserProfile;