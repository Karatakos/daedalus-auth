
import { MockedUserRepo } from './user.mock.repo.js';
import { DynamoUserRepo } from './user.dynamo.repo.js';
import { UserRepo } from './user.repo.js';

class UserRepoFactory {
    constructor() {}

    static make(mockedUsers: any = null): UserRepo {
        if (mockedUsers)
            return new MockedUserRepo(mockedUsers);

        return new DynamoUserRepo();
    }
}

export {UserRepoFactory}