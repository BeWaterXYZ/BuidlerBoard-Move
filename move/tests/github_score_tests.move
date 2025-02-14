#[test_only]
module github_score_addr::github_score_tests {
    use std::signer;
    use std::string;
    use github_score_addr::github_score;

    #[test(admin = @github_score_addr)]
    fun test_submit_developer_score(admin: &signer) {
        // 初始化测试环境
        github_score::initialize_for_test(admin);

        // 提交开发者分数
        github_score::submit_developer_score(
            admin,
            string::utf8(b"123"),
            string::utf8(b"test_user"),
            95,
            1000,
            500,
            1000000,
        );

        // 验证分数
        let score = github_score::get_developer_score(signer::address_of(admin));
        assert!(score == 95, 0);
    }

    #[test(admin = @github_score_addr)]
    fun test_submit_project_score(admin: &signer) {
        // 初始化测试环境
        github_score::initialize_for_test(admin);

        // 提交项目分数
        github_score::submit_project_score(
            admin,
            string::utf8(b"456"),
            string::utf8(b"test_project"),
            88,
            2000,
            300,
            1000000,
        );

        // 验证分数
        let score = github_score::get_project_score(signer::address_of(admin));
        assert!(score == 88, 0);
    }
} 