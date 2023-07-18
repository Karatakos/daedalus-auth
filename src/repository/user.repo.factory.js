
import {MockedUserRepo} from './user.mock.repo.js';
import {DynamoUserRepo} from './user.dynamo.repo.js';

class UserRepoFactory {
    constructor() {}

    static make(mockedUsers= null) {
        if (mockedUsers)
            return new MockedUserRepo(mockedUsers);

        return new DynamoUserRepo();
    }
}

export {UserRepoFactory}