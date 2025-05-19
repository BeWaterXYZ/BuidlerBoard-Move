module my_addr::rankor_only_star {
    use std::string;
    use std::vector;

    struct RankingAlgorithm has drop, store {
        prompt: string::String,
        recommend_models: vector<string::String>,
    }
    
    #[view]
    public fun rank() : RankingAlgorithm {
        // return the result: prompt & recommend models .
        let recommend_models = vector::empty<string::String>();
        vector::push_back(&mut recommend_models, string::utf8(b"GPT-4o"));
        vector::push_back(&mut recommend_models, string::utf8(b"DeepSeek"));

        RankingAlgorithm {
            prompt: string::utf8(b"here arae the projects informations, plz rank the projects only based on the star number of the project."),
            recommend_models,
        }
    }
    
}