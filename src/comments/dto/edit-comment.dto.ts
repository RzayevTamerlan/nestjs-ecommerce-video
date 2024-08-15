import { IsNotEmpty, IsNumber, IsString, Max, Min, MinLength } from 'class-validator';
import { COMMENT_CONTENT_TOO_SHORT_ERROR, MAX_RATING_ERROR, MIN_RATING_ERROR } from '../comments.constants';

export class EditCommentDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5, {
    message: COMMENT_CONTENT_TOO_SHORT_ERROR,
  })
  content: string;

  @IsNumber()
  @Min(1, {
    message: MIN_RATING_ERROR,
  })
  @Max(5, {
    message: MAX_RATING_ERROR,
  })
  rating: number;
}