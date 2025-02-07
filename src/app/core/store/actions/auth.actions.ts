import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user.model';
import { VoucherOption } from '../../models/voucher.model';

export const login = createAction(
  '[Auth] Login',
  props<{ email: string; password: string }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: string }>()
);

export const register = createAction(
  '[Auth] Register',
  props<{ user: User }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: string }>()
);

export const registerError = createAction(
  '[Auth] Register Error',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout');

export const convertPoints = createAction(
  '[Auth] Convert Points',
  props<{ points: number; voucher: VoucherOption }>()
);

export const convertPointsSuccess = createAction(
  '[Auth] Convert Points Success',
  props<{ user: User }>()
);

export const convertPointsFailure = createAction(
  '[Auth] Convert Points Failure',
  props<{ error: string }>()
); 